import axios, {AxiosInstance} from "axios";
import {Environment} from "../environment";
import {AxiosRequestConfig} from "axios/index";
import {
  BrazeRecipient,
  BrazeResponseWrapper,
  BrazeTriggerCampaignSendRequest,
  BrazeTriggerCampaignSendResponse,
  BrazeTriggerProperties, TriggerCampaignSendReturn
} from "./types";

export const initBraze = (env: Environment) => {
  return axios.create({
    baseURL: env.BRAZE_BASE_URL,
    headers: {
      Authorization: `Bearer ${env.BRAZE_TOKEN}`,
    },
  });
};

export const sendEmail = async (env: Environment, braze: AxiosInstance, templateId: string, recipient: string) => {
  const email = {
    app_id: env.BRAZE_APP_ID,
    email_template_id: templateId,
    from: `from <${env.BRAZE_EMAIL_DISPLAY_NAME}>`,
  };
  const req = {
    messages: {
      email,
    },
    external_user_ids: [recipient],
  };

  const config: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'application/json',
    },
    url: env.BRAZE_SEND_MESSAGE_ENDPOINT,
    method: 'post',
    data: req,
  };

  let success = false;
  try {
    const res = await braze.request(config);
    success = res.data.message === 'success';
  } catch (err) {
    console.error(err);
  }
  return success;
}

export const triggerCampaignSend = async (
  env: Environment,
  braze: AxiosInstance,
  campaignId: string,
  recipients: BrazeRecipient[],
  apiTriggerProperties?: BrazeTriggerProperties
): Promise<TriggerCampaignSendReturn> => {
    const req: BrazeTriggerCampaignSendRequest = {
    campaign_id: campaignId,
    broadcast: false,
    trigger_properties: apiTriggerProperties,
    recipients,
  };

  const config: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'application/json',
    },
    url: env.BRAZE_TRIGGER_CAMPAIGN_SEND_ENDPOINT,
    method: 'post',
    data: req,
  };

  const res = await braze.request<BrazeTriggerCampaignSendResponse>(config);
  const { message, dispatch_id } = res.data;
  console.log('Successfully sent message with dispatch id: ', dispatch_id);

  return {
    success: message === 'success',
    dispatch_id
  };
}
