export type Environment = {
  BRAZE_TOKEN: string;
  BRAZE_BASE_URL: string;
  BRAZE_APP_ID: string;
  BRAZE_EMAIL_DISPLAY_NAME: string;
  BRAZE_SEND_MESSAGE_ENDPOINT: string;
  BRAZE_TRIGGER_CAMPAIGN_SEND_ENDPOINT: string;
  HYGRAPH_TOKEN: string;
  HYGRAPH_URL: string;
}

const resolveEnvironment = (): Environment | null => {
  const {
    BRAZE_TOKEN,
    BRAZE_BASE_URL,
    HYGRAPH_TOKEN,
    HYGRAPH_URL,
    BRAZE_APP_ID,
    BRAZE_EMAIL_DISPLAY_NAME,
    BRAZE_SEND_MESSAGE_ENDPOINT,
    BRAZE_TRIGGER_CAMPAIGN_SEND_ENDPOINT
  } = process.env;

  if (
  !BRAZE_TOKEN
    || !BRAZE_BASE_URL
    || !HYGRAPH_TOKEN
    || !HYGRAPH_URL
    || !BRAZE_APP_ID
    || !BRAZE_EMAIL_DISPLAY_NAME
    || !BRAZE_SEND_MESSAGE_ENDPOINT
    || !BRAZE_TRIGGER_CAMPAIGN_SEND_ENDPOINT
  ) {
    console.error('Unable to resolve environment variables, bailing');
    return null
  }

  return {
    BRAZE_BASE_URL,
    BRAZE_TOKEN,
    BRAZE_APP_ID,
    BRAZE_EMAIL_DISPLAY_NAME,
    BRAZE_SEND_MESSAGE_ENDPOINT,
    BRAZE_TRIGGER_CAMPAIGN_SEND_ENDPOINT,
    HYGRAPH_TOKEN,
    HYGRAPH_URL,
  };
};

export default resolveEnvironment;
