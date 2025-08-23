import posthog from 'posthog-js'

// Initialize PostHog (this is already done in main.tsx, but we can add utility functions here)
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  try {
    posthog.capture(eventName, properties)
  } catch (error) {
    console.warn('PostHog tracking failed:', error)
  }
}

export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  try {
    posthog.identify(userId, properties)
  } catch (error) {
    console.warn('PostHog identification failed:', error)
  }
}

export const setUserProperties = (properties: Record<string, any>) => {
  try {
    posthog.people.set(properties)
  } catch (error) {
    console.warn('PostHog user properties setting failed:', error)
  }
}

// Common tracking events for your app
export const trackDeploymentCreated = (projectName: string, template?: string) => {
  trackEvent('deployment_created', {
    project_name: projectName,
    template: template || 'custom',
    timestamp: new Date().toISOString()
  })
}

export const trackDeploymentSuccess = (projectName: string, deploymentUrl: string) => {
  trackEvent('deployment_success', {
    project_name: projectName,
    deployment_url: deploymentUrl,
    timestamp: new Date().toISOString()
  })
}

export const trackAnalyticsEnabled = (projectName: string) => {
  trackEvent('analytics_enabled', {
    project_name: projectName,
    timestamp: new Date().toISOString()
  })
}

export const trackWalletConnected = (walletType: string) => {
  trackEvent('wallet_connected', {
    wallet_type: walletType,
    timestamp: new Date().toISOString()
  })
}

export const trackPageView = (pageName: string) => {
  trackEvent('page_view', {
    page_name: pageName,
    timestamp: new Date().toISOString()
  })
}

// Session recording is automatically enabled via PostHog configuration
// The session recording will start automatically when users visit your site
// You can control it via PostHog dashboard settings
