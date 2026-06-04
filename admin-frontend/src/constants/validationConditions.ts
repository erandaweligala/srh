import {ConfigModel} from "../model/settings.model.ts";

export const MSISDN_MAX_LENGTH = 15;
export const MSISDN_MIN_LENGTH = 7;

export const EMAIL_MAX_LENGTH = 50;

export const ID_MAX_LENGTH = 15;
export const ID_MIN_LENGTH = 7;

export const DEBOUNCE_TIME_IN_MS = 1000;

export const REFRESH_TOKEN_REQUEST_TIME_RANGE_SECONDS = 600;

export const MSISDN_VALIDATION_REGEX = "^(?:0|\\+267)?(?:71[0-9]{6}|74[0-2][0-9]{5}|745[0-9]{5}|746[0-9]{5}|747[0-9]{5}|754[0-9]{5}|755[0-9]{5}|756[0-9]{5}|759[0-9]{5}|760[0-9]{5}|761[0-9]{5}|762[0-9]{5}|766[0-9]{5}|767[0-9]{5}|770[0-9]{5}|771[0-9]{5}|776[0-9]{5}|777[0-9]{5}|778[0-9]{5}|79250000|79260000|79270000)$";
export const DEFAULT_OTP_LENGTH = 6;

export const EXCEL_AND_CSV_FILE_TYPE_VALIDATOR: string[] = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
export const IMAGE_FILE_TYPE_VALIDATOR: string[] = ['jpg', 'png', 'jpeg', 'PNG', 'JPEG', 'JPG'];
export const MAX_UPLOAD_FILE_SIZE: number = 5 * 1024 * 1024;

export const DEFAULT_OTP_VALIDITY_LIST: string = '30,60,120,180';
export const DEFAULT_OTP_LENGTH_LIST: string = '4,6';
export const DEFAULT_OTP_RETRY_COUNT_LIST: string = '3,4,5';
export const DEFAULT_VERSION = '1.1.0';

export const DefaultConfigurations: ConfigModel[] = [
    {
        id: 1,
        configKey: "OTPLength",
        configValue: "6"
    },
    {
        id: 2,
        configKey: "MinRechargeValue",
        configValue: "0.7"
    },
    {
        id: 3,
        configKey: "MaxRechargeValue",
        configValue: "1000"
    },
    {
        id: 4,
        configKey: "MsisdnValidationRegex",
        configValue: MSISDN_VALIDATION_REGEX
    },
    {
        id: 5,
        configKey: "BalanceTransferPINLength",
        configValue: "4"
    },
    {
        id: 6,
        configKey: "IdNumberMaxLength",
        configValue: "9"
    },
    {
        id: 7,
        configKey: "RefreshTokenRequestTimeRangeInSeconds",
        configValue: "120"
    },
    {
        id: 8,
        configKey: "OTPValidity",
        configValue: "30"
    },
    {
        id: 9,
        configKey: "OTPRetryCount",
        configValue: "4"
    },
    {
        id: 10,
        configKey: "OTPValidityList",
        configValue: "30,120,180"
    },
    {
        id: 11,
        configKey: "OTPLengthList",
        configValue: "4,6"
    },
    {
        id: 12,
        configKey: "OTPRetryCount",
        configValue: "3,4,5"
    },
    {
        id: 13,
        configKey: "Version",
        configValue: '1.1.0'
    }
];

