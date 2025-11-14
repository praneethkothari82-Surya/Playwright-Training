pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                bat 'npm ci'
            }
        }
        
        stage('Install Playwright Browsers') {
            steps {
                echo 'Installing Playwright browsers...'
                bat 'npx playwright install --with-deps'
            }
        }
        
        stage('Run Tests') {
            steps {
                echo 'Running Playwright tests...'
                script {
                    try {
                        bat 'npx playwright test --grep "@SmokeTest"'
                    } catch (Exception e) {
                        echo "Tests failed, but continuing to publish results..."
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo 'Publishing test results...'
            
            // Publish HTML Report
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Test Report',
                reportTitles: ''
            ])
            
            // Publish JUnit Results
            junit testResults: 'test-results/junit.xml', allowEmptyResults: true
            
            // Archive artifacts
            archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
            archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
            
            // Archive traces, videos, screenshots
            archiveArtifacts artifacts: 'test-results/**/trace.zip', allowEmptyArchive: true
            archiveArtifacts artifacts: 'test-results/**/*.webm', allowEmptyArchive: true
            archiveArtifacts artifacts: 'test-results/**/*.png', allowEmptyArchive: true
        }
        
        success {
            echo 'Tests passed successfully!'
        }
        
        failure {
            echo 'Tests failed!'
        }
    }
}
