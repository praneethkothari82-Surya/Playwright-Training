pipeline {
    agent any
    
    environment {
        // Default workers for CI (will be overridden in System Info stage)
        PLAYWRIGHT_WORKERS = '3'
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
                    // Get system information
                    def isWindows = isUnix() ? false : true
                    
                    if (isWindows) {
                        // Windows: Use PowerShell to get CPU count
                        def cpuCount = bat(returnStdout: true, script: '@echo off && powershell -Command "[System.Environment]::ProcessorCount"').trim()
                        def cpuCores = cpuCount.toInteger()
                        def workers = Math.floor(cpuCores * 0.75).toInteger()
                        
                        // Set environment variable for this build
                        env.PLAYWRIGHT_WORKERS = workers.toString()
                        
                        echo "========================================"
                        echo "Jenkins Agent System Information"
                        echo "========================================"
                        echo "CPU Cores Available: ${cpuCores}"
                        echo "Playwright Workers: ${env.PLAYWRIGHT_WORKERS}"
                        echo "========================================"
                    } else {
                        // Linux/Mac: Use nproc or sysctl
                        def cpuCount = sh(returnStdout: true, script: 'nproc || sysctl -n hw.ncpu').trim()
                        def cpuCores = cpuCount.toInteger()
                        def workers = Math.floor(cpuCores * 0.75).toInteger()
                        
                        env.PLAYWRIGHT_WORKERS = workers.toString()
                        
                        echo "========================================"
                        echo "Jenkins Agent System Information"
                        echo "========================================"
                        echo "CPU Cores Available: ${cpuCores}"
                        echo "Playwright Workers: ${env.PLAYWRIGHT_WORKERS}"
                        echo "========================================"
                    }
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
            script {
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
        }
        
        success {
            echo 'Tests passed successfully!'
        }
        
        failure {
            echo 'Tests failed!'
        }
    }
}
