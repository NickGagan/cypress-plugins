// import { WebClient } from '@slack/web-api';
// import { WebClient } from '@slack/web-api';
import { cypressRunStatus } from './slack';
import {
  getChatBotClient,
  getIncomingWebHookClient,
  sendViaBot,
  sendViaWebhook
} from './slackClient';

// jest.mock('@slack/web-api')
// const mockSlackWebClient = require('@slack/web-api')

describe('sends a slack message', () => {
  // beforeAll(() => {

  // });
  describe('with valid auth credentials ', () => {
    it('should send a message via an IncomingWebHook', async () => {
      // arrange
      const testWebhookMessage = {
        headingText: 'sent via webhook',
        status: cypressRunStatus['build:failed']
      };
      const webhookUrl = 'foo'

      jest.doMock('@slack/webhook', () => {
        const mSlack = {
        
            send: jest.fn().mockResolvedValue({ text: 'ok' })
       
        };
        return { IncomingWebhook: jest.fn(() => mSlack) };
      });

      return import('@slack/webhook').then(async (moduleName) => {
      // act
      const res = await sendViaWebhook(
        testWebhookMessage,
        new moduleName.IncomingWebhook(webhookUrl)
      );

      // assert
      expect(res).toEqual({ text: 'ok' });
      });


    });
    it('should mock a ChatBot', async () => {
      // arrange


      const testChatBotMessage = {
        channel: 'CESHQPXJ6',
        headingText: 'sent via webhook',
        status: cypressRunStatus['build:failed']
      };

      jest.doMock('@slack/web-api', () => {
        const mSlack = {
          chat: {
            postMessage: jest.fn().mockResolvedValue({ ok: true })
          }
        };
        return { WebClient: jest.fn(() => mSlack) };
      });

      return import('@slack/web-api').then(async (moduleName) => {
        const res = await sendViaBot(
          testChatBotMessage,
          new moduleName.WebClient()
        );
        expect(res).toEqual({
          ok: true
        });
      });
    });
  });

  describe('with invalid auth credentials ', () => {
    it('should fail when a blank webhook is provided', async () => {
      // arrange
      const testWebhookMessage = {
        headingText: 'sent via webhook',
        status: cypressRunStatus['build:failed']
      };
      const incomingWebHookClient = getIncomingWebHookClient('');

      // act
      const res = await sendViaWebhook(
        testWebhookMessage,
        incomingWebHookClient
      );

      // assert
      expect(res).toEqual(
        new TypeError("Cannot read properties of null (reading 'replace')")
      );
    });
    it('should fail when a bad url is provided', async () => {
      // arrange
      const testWebhookMessage = {
        headingText: 'sent via webhook',
        status: cypressRunStatus['build:failed']
      };
      const incomingWebHookClient = getIncomingWebHookClient('http://foo');

      // act
      const res = await sendViaWebhook(
        testWebhookMessage,
        incomingWebHookClient
      );

      // assert
      expect(res).toEqual(
        new Error('A request error occurred: getaddrinfo ENOTFOUND foo')
      );
    });
    it('should fail when hooks url is missing the token', async () => {
      // arrange
      const testWebhookMessage = {
        headingText: 'sent via webhook',
        status: cypressRunStatus['build:failed']
      };
      const incomingWebHookClient = getIncomingWebHookClient(
        'https://hooks.slack.com/services/TEA926DBJ/B03DFKG8QEM/'
      );
      // act
      const res = await sendViaWebhook(
        testWebhookMessage,
        incomingWebHookClient
      );

      // assert
      expect(res).toEqual(
        new Error('An HTTP protocol error occurred: statusCode = 403')
      );
    });
    it('should fail when hooks url is missing the workspace', async () => {
      // arrange
      const testWebhookMessage = {
        headingText: 'sent via webhook',
        status: cypressRunStatus['build:failed']
      };
      const incomingWebHookClient = getIncomingWebHookClient(
        'https://hooks.slack.com/services/foo/B03DFKG8QEM/'
      );
      // act
      const res = await sendViaWebhook(
        testWebhookMessage,
        incomingWebHookClient
      );

      // assert
      expect(res).toEqual(
        new Error('An HTTP protocol error occurred: statusCode = 404')
      );
    });
    it('should fail when hooks url is missing the channel', async () => {
      // arrange
      const testWebhookMessage = {
        headingText: 'sent via webhook',
        status: cypressRunStatus['build:failed']
      };
      const incomingWebHookClient = getIncomingWebHookClient(
        'https://hooks.slack.com/services/TEA926DBJ/'
      );
      // act
      const res = await sendViaWebhook(
        testWebhookMessage,
        incomingWebHookClient
      );

      // assert
      expect(res).toEqual(
        new Error('An HTTP protocol error occurred: statusCode = 301')
      );
    });
    it('should send a message via a ChatBot', async () => {
      // arrange
      const testChatBotMessage = {
        channel: 'CESHQPXJ6',
        headingText: 'sent via webhook',
        status: cypressRunStatus['build:failed']
      };

      const chatBotClient = getChatBotClient('fgdgf');

      // act
      const res = await sendViaBot(testChatBotMessage, chatBotClient);

      expect(res).toEqual(new Error('An API error occurred: invalid_auth'));
    });
  });
});
