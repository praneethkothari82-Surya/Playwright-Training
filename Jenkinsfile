pipeline {
    agent any
    
    environment {
        // Dynamically set workers based on available CPU cores
        // Use 75% of available cores for optimal performance
        PLAYWRIGHT_WORKERS = "${(Runtime.getRuntime().availableProcessors() * 0.75).toInteger()}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                checkout scm
            }
        }
        
        stage('System Info') {
            steps {
                script {
                    def cpuCores = Runtime.getRuntime().availableProcessors()
                    def maxMemory = Runtime.getRuntime().maxMemory() / (1024 * 1024 * 1024)
                    
                    echo "========================================"
                    echo "Jenkins Agent System Information"
                    echo "========================================"
                    echo "CPU Cores Available: ${cpuCores}"
                    echo "Max Memory (GB): ${maxMemory.round(2)}"
                    echo "Playwright Workers: ${PLAYWRIGHT_WORKERS}"
                    echo "========================================"
                }
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
                        // Use PLAYWRIGHT_WORKERS environment variable
                        bat "npx playwright test --grep \"@SmokeTest\" --project=chromium --workers=${env.PLAYWRIGHT_WORKERS}"
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
            
            // Publish Simple HTML Report (CSP-friendly)
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'test-results',
                reportFiles: 'simple-report.html',
                reportName: 'Playwright Simple Report',
                reportTitles: ''
            ])
            
            // Publish Full HTML Report (may need CSP config)
            publishHTML([
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Full Report',
                reportTitles: ''
            ])
            
            // Publish JUnit Results
            junit testResults: 'test-results/junit.xml', allowEmptyResults: true
            
            // Archive all test artifacts (reports, traces, videos, screenshots)
            archiveArtifacts artifacts: 'playwright-report/**/*,test-results/**/*', allowEmptyArchive: true, onlyIfSuccessful: false
        }
        
        success {
            echo 'Tests passed successfully!'
        }
        
        failure {
            echo 'Tests failed!'
        }
    }
}
