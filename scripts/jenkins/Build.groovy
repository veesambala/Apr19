#!groovy​

/**
 * Build file for new mobile widget.
 * Builds according to the Burst CICD pipeline specifications.
 * Builds are pushed to artifactory and code is pulled from git.
 * Creates a tar package for distribution along with a config.json file.
 *
 * Expected environmental parameters, IE accessible by env:
 *      APPLICATION_NAME - the name of the application to be built -- new-mobile-widget
 *      APPLICATION_GROUP_NAME - the name of the application group the application belongs to -- web
 *      BUILD_TYPE - either SNAPSHOT or RELEASE
 *                  SNAPSHOT is for development builds only, will never be deployed to stage or prod
 *                  RELEASE is for release ready builds, will be deployed to dev, stage, and prod
 *      BUILD_FROM - the git branch to create a build for, ex: heads/jira/sprints/171
 *      VERSION - A semantic version to identify this release with, ex: 1.31.3
 *                Only used in RELEASE build types, ignored for SNAPSHOT build types
 *      RUN_TEST - A boolean value, true if the test step should be run (unit tests), false otherwise
 *      AUTO_DEPLOY_DEV - A boolean value, true if on success of the build it should deploy to dev automatically,
 *                        false otherwise
 *      NOTIFICATION_EMAILS - A multi line separated string of the emails that should be sent notifications to,
 *                            Can specify levels filters for notifications as colon separated additions to the email
 *                            Can specify build type filters for notifications as semicolon separated additions
 *                            Can specify environment type filters for deploys as comma separated additions
 *                            Possible levels - ALL,START,SUCCESS,FAILURE,CHANGED,UNSTABLE,ABORTED -- leave none for ALL
 *                            Possible build types - ALL,SNAPSHOT,RELEASE -- leave none for ALL
 *                            Possible environments - ALL,DEV,STAGE,PROD -- leave none for ALL
 *                            ex:
 *                              markk@burst.com -- everything
 *                              markk@burst.com:CHANGED;RELEASE,STAGE,PROD -- only release jobs that have changed in state for staging and production environments
 *                              markk@burst.com:FAILURE;SNAPSHOT;RELEASE -- release or snapshot jobs that have failed for any environment
 */
 @Library('jenkins-burst-libraries@master') _

//noinspection GroovyAssignabilityCheck
pipeline {
    agent { label 'linux' }
    options {
        skipDefaultCheckout()
        timeout(time: 1, unit: 'HOURS')
        timestamps()
    }
    stages {
        stage ('Initialize') {
            steps {
                script {
                    burstBuildJob.init(this)
                    burstBuildJob.notifyStarted()
                    burstBuildJob.verifyState()
                }
            }
        }

        stage('Setup') {
            tools {
                nodejs 'NodeJS_7.7.4'
            }
            steps {
                sh 'npm cache clean'
                sh 'npm install'
            }
        }

        stage('Test') {
            when {
                expression {
                    env.RUN_TEST == 'true' || env.RUN_TEST == true // no tests currently
                }
            }
            tools {
                nodejs 'NodeJS_7.7.4'
            }
            steps {
                sh 'npm run test:jenkins'

                script {
                    burstBuildJob.publishHtmlTestResults('./coverage/html', 'index.html')
                }
            }
        }

        stage('Build') {
            tools {
                nodejs 'NodeJS_7.7.4'
            }
            steps {
                script {
                    if (env.BUILD_TYPE == 'SNAPSHOT') {
                        sh 'npm run build:dev'
                    } else if (env.BUILD_TYPE == 'RELEASE') {
                        sh 'npm run build:aot:prod'
                    } else {
                        throw Exception("Unrecognized BUILD_TYPE of ${env.BUILD_TYPE}")
                    }
                }

                sh 'cp -R ./customization/ ./dist/'
                sh 'cp ./src/assets/config.json ./nmw-config.json'
                sh 'tar -czvf nmw-dist.tar.gz -C ./dist .'
            }
        }

        stage('Finalize') {
            steps {
                script {
                    burstBuildJob.pushArtifact('./nmw-dist.tar.gz', './nmw-config.json')
                    burstBuildJob.tagBranch()

                    def additionalParameters = [
                        [$class: 'BooleanParameterValue', name: 'RUN_PRE_DEPLOY', value: false],
                        [$class: 'BooleanParameterValue', name: 'RUN_POST_DEPLOY', value: false]
                    ]

                    burstBuildJob.startDeployJob(null, additionalParameters)
                }
            }
        }
    }
    post {
        success {
            script {
                burstBuildJob.notifySuccess()
            }
        }
        unstable {
            script {
                burstBuildJob.notifyUnstable()
            }
        }
        failure {
            script {
                burstBuildJob.notifyFailure()
            }
        }
        aborted {
            script {
                burstBuildJob.notifyAborted()
            }
        }
        changed {
            script {
                burstBuildJob.notifyChanged()
            }
        }
    }
}

