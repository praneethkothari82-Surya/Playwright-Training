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
            archiveArtifacts artifacts: 'test-results/**/*.json', allowEmptyArchive: true
            
            // Archive traces, videos, screenshots only if they exist
            script {
                if (fileExists('test-results')) {
                    def traceFiles = findFiles(glob: 'test-results/**/trace.zip')
                    if (traceFiles.length > 0) {
                        archiveArtifacts artifacts: 'test-results/**/trace.zip', allowEmptyArchive: true
                    }
                    
                    def videoFiles = findFiles(glob: 'test-results/**/*.webm')
                    if (videoFiles.length > 0) {
                        archiveArtifacts artifacts: 'test-results/**/*.webm', allowEmptyArchive: true
                    }
                    
                    def screenshotFiles = findFiles(glob: 'test-results/**/*.png')
                    if (screenshotFiles.length > 0) {
                        archiveArtifacts artifacts: 'test-results/**/*.png', allowEmptyArchive: true
                    }
                }
            }
        }
        
        success {
            echo 'Tests passed successfully!'
        }
        
        failure {
            echo 'Tests failed!'
        }
    }
}
