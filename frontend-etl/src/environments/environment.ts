// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
    production: false,
    token: true,          // 是否添加token
    cache: true,          // 是否添加cache

    // loginType: 'etl', // 登录类型
    loginType: 'authority', // 登录类型

    mining: 'http://localhost:9000' // 数据挖掘地址
};

