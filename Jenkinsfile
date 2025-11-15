pipeline {
    agent any
    
    environment {
        // Default workers for CI (will be overridden in System Info stage)
        PLAYWRIGHT_WORKERS = '3'
        CI = 'true'
    }
    
    options {
        // Clean workspace before build to ensure fresh code
        skipDefaultCheckout(true)
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    try {
                        echo 'Cleaning workspace and checking out fresh code...'
                        deleteDir()  // Clean everything
                        checkout scm
                        echo '✓ Fresh checkout successful'
                    } catch (Exception e) {
                        echo "✗ Checkout failed: ${e.message}"
                        throw e
                    }
                }
            }
        }
        
        stage('System Info') {
            steps {
                script {
                    try {
                        // Get system information
                        def isWindows = isUnix() ? false : true
                        
                        if (isWindows) {
                            // Windows: Use PowerShell to get CPU count
                            def cpuCount = bat(returnStdout: true, script: '@echo off && powershell -Command "[System.Environment]::ProcessorCount"').trim()
                            def cpuCores = cpuCount.toInteger()
                            def workers = (cpuCores * 0.75) as Integer
                            
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
                            def workers = (cpuCores * 0.75) as Integer
                            
                            env.PLAYWRIGHT_WORKERS = workers.toString()
                            
                            echo "========================================"
                            echo "Jenkins Agent System Information"
                            echo "========================================"
                            echo "CPU Cores Available: ${cpuCores}"
                            echo "Playwright Workers: ${env.PLAYWRIGHT_WORKERS}"
                            echo "========================================"
                        }
                    } catch (Exception e) {
                        echo "⚠ System info failed, using default workers: ${e.message}"
                        env.PLAYWRIGHT_WORKERS = '3'
                    }
                }
            }
        }
        
        stage('Clean Previous Artifacts') {
            steps {
                script {
                    try {
                        echo 'Cleaning previous test results...'
                        bat '''
                            if exist test-results rmdir /s /q test-results
                            if exist playwright-report rmdir /s /q playwright-report
                            if exist allure-results rmdir /s /q allure-results
                            if exist allure-report rmdir /s /q allure-report
                        '''
                        echo '✓ Cleanup successful'
                    } catch (Exception e) {
                        echo "⚠ Cleanup warning (non-critical): ${e.message}"
                    }
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                script {
                    try {
                        echo 'Installing dependencies...'
                        echo 'Node version:'
                        bat 'node --version'
                        echo 'NPM version:'
                        bat 'npm --version'
                        echo 'Running npm ci...'
                        bat 'npm ci'
                        echo '✓ Dependencies installed successfully'
                    } catch (Exception e) {
                        echo "✗ Dependency installation failed: ${e.message}"
                        echo "Attempting npm install as fallback..."
                        try {
                            bat 'npm install'
                            echo '✓ npm install succeeded as fallback'
                        } catch (Exception e2) {
                            echo "✗ Both npm ci and npm install failed"
                            throw e2
                        }
                    }
                }
            }
        }
        
        stage('Install Playwright Browsers') {
            steps {
                script {
                    try {
                        echo 'Installing Playwright browsers...'
                        bat 'npx playwright install --with-deps chromium'
                        echo '✓ Playwright browsers installed successfully'
                    } catch (Exception e) {
                        echo "✗ Browser installation failed: ${e.message}"
                        echo "Attempting to continue anyway..."
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                script {
                    try {
                        echo 'Running Playwright tests...'
                        echo "Workers: ${env.PLAYWRIGHT_WORKERS}"
                        bat "npx playwright test --grep \"@SmokeTest\" --project=chromium --workers=${env.PLAYWRIGHT_WORKERS}"
                        echo '✓ All tests passed'
                    } catch (Exception e) {
                        echo "⚠ Some tests failed: ${e.message}"
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }
    }
    
    post {
        always {
            script {
                node {
                    echo 'Publishing test results...'
                    
                    // Publish JUnit Results
                    junit testResults: 'test-results/junit.xml', allowEmptyResults: true
                    
                    // Publish Allure Report
                    allure([
                        includeProperties: false,
                        jdk: '',
                        properties: [],
                        reportBuildPolicy: 'ALWAYS',
                        results: [[path: 'allure-results']]
                    ])
                    
                    // Archive all test artifacts (reports, traces, videos, screenshots)
                    archiveArtifacts artifacts: 'playwright-report/**/*,test-results/**/*,allure-results/**/*', allowEmptyArchive: true, onlyIfSuccessful: false
                    
                    // Publish Simple HTML Report (CSP-friendly)
                    publishHTML([
                        allowMissing: true,
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
