import axios from "axios";
import {type Environment} from "../environment";

export const initHygraph = (env: Environment) => {
  return axios.create({
    baseURL: env.HYGRAPH_URL,
    headers: {
      Authorization: `Bearer ${env.HYGRAPH_TOKEN}`,
    },
  });
};


