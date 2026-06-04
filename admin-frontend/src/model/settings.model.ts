export interface SettingsModel {
    configList: ConfigModel[];
}

export interface ConfigModel {
    id: number;
    configKey: string;
    configValue: string;
}