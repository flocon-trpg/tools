import {
    Alert,
    AlertProps,
    Checkbox,
    Collapse,
    Form,
    Image,
    Input,
    Radio,
    Space,
    Table,
} from 'antd';
import produce from 'immer';
import { NextPage } from 'next';
import React, { useCallback, useMemo, useState } from 'react';

const apiKey = 'apiKey';
const authDomain = 'authDomain';
const projectId = 'projectId';
const storageBucket = 'storageBucket';
const messagingSenderId = 'messagingSenderId';
const appId = 'appId';

const firebaseConfigKeys = [
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
] as const;

type FirebaseConfig = {
    [apiKey]: string;
    [authDomain]: string;
    [projectId]: string;
    [storageBucket]: string;
    [messagingSenderId]: string;
    [appId]: string;
};

const anonymous = 'anonymous';
const email = 'email';
const google = 'google';
const facebook = 'facebook';
const github = 'github';
const twitter = 'twitter';
const phone = 'phone';

type AuthProviders = {
    [anonymous]: boolean;
    [email]: boolean;
    [google]: boolean;
    [facebook]: boolean;
    [github]: boolean;
    [twitter]: boolean;
    [phone]: boolean;
};

namespace AuthProviders {
    export const isEmpty = (source: AuthProviders): boolean => {
        return (
            !source.anonymous &&
            !source.email &&
            !source.google &&
            !source.facebook &&
            !source.github &&
            !source.twitter &&
            !source.phone
        );
    };
}

type ConfigState = {
    NEXT_PUBLIC_FIREBASE_CONFIG: FirebaseConfig;
    NEXT_PUBLIC_API_HTTP: string;
    NEXT_PUBLIC_API_WS: string;
    NEXT_PUBLIC_AUTH_PROVIDERS: AuthProviders;
    NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED: boolean;
};

type ToStringValue<T> = {
    [K in keyof T]: string | undefined;
};

type Config = ToStringValue<ConfigState>;

const toConfig = (source: ConfigState): Config => {
    return {
        NEXT_PUBLIC_API_HTTP: source.NEXT_PUBLIC_API_HTTP,
        NEXT_PUBLIC_API_WS: source.NEXT_PUBLIC_API_WS,
        NEXT_PUBLIC_AUTH_PROVIDERS: [
            source.NEXT_PUBLIC_AUTH_PROVIDERS[anonymous] ? anonymous : null,
            source.NEXT_PUBLIC_AUTH_PROVIDERS[email] ? email : null,
            source.NEXT_PUBLIC_AUTH_PROVIDERS[facebook] ? facebook : null,
            source.NEXT_PUBLIC_AUTH_PROVIDERS[github] ? github : null,
            source.NEXT_PUBLIC_AUTH_PROVIDERS[google] ? google : null,
            source.NEXT_PUBLIC_AUTH_PROVIDERS[phone] ? phone : null,
            source.NEXT_PUBLIC_AUTH_PROVIDERS[twitter] ? twitter : null,
        ].reduce<string>((seed, elem) => {
            if (elem == null) {
                return seed;
            }
            if (seed === '') {
                return elem;
            }
            return `${seed},${elem}`;
        }, ''),
        NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED: source.NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED
            ? 'true'
            : undefined,
        NEXT_PUBLIC_FIREBASE_CONFIG: JSON.stringify(source.NEXT_PUBLIC_FIREBASE_CONFIG),
    };
};

const isEmptyString = (value: string): boolean => {
    return value.trim() === '';
};

namespace ErrorMessages {
    export const mustNotBeEmpty = 'この値は必須です。';
}

const staticFiles = 'staticFiles';
const nextjs = 'nextjs';
const headerPadding = 16;
const collapsePadding = 12;

export const WebServer: NextPage = () => {
    const [configState, setConfigState] = useState<ConfigState>({
        NEXT_PUBLIC_API_HTTP: '',
        NEXT_PUBLIC_API_WS: '',
        NEXT_PUBLIC_AUTH_PROVIDERS: {
            anonymous: false,
            email: false,
            google: false,
            facebook: false,
            github: false,
            twitter: false,
            phone: false,
        },
        NEXT_PUBLIC_FIREBASE_CONFIG: {
            apiKey: '',
            authDomain: '',
            projectId: '',
            storageBucket: '',
            messagingSenderId: '',
            appId: '',
        },
        NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED: true,
    });
    const setConfigStateWithImmer = useCallback(
        (recipe: (state: ConfigState) => void) => {
            setConfigState(produce(configState, recipe));
        },
        [configState]
    );

    const [autoWsState, setAutoWsState] = useState(true);
    const autoWsUrl = configState.NEXT_PUBLIC_API_HTTP.trim()
        .replace(/^https:\/\//, 'wss://')
        .replace(/^http:\/\//, 'ws://');

    const config = useMemo(() => {
        const config = toConfig(configState);
        if (autoWsState) {
            config.NEXT_PUBLIC_API_WS = autoWsUrl;
        }
        return config;
    }, [autoWsState, autoWsUrl, configState]);
    const [deployType, setDeployType] = useState<typeof staticFiles | typeof nextjs>(staticFiles);
    const [envTxt, envTableDataSource] = useMemo(() => {
        let envTxtResult = '';
        const envTableDataSourceResult: { key: string; value: string }[] = [];
        for (const key in config) {
            const value: string | undefined = (config as any)[key];
            if (value == null) {
                continue;
            }

            if (envTxtResult === '') {
                envTxtResult = `${key}=${value}`;
            } else {
                envTxtResult = `${envTxtResult}
${key}=${value}`;
            }

            envTableDataSourceResult.push({ key, value });
        }
        return [envTxtResult, envTableDataSourceResult];
    }, [config]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', padding: 8 }}>
            <div>
                <h1>使い方</h1>
                <ol>
                    <li>左半分のエリアで値を編集します。</li>
                    <li>右半分のエリアに表示されたデータをデプロイに利用します。</li>
                </ol>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div style={{ flex: 1 }}>
                    <h2>Firebase構成オブジェクト</h2>
                    <p>{'両端にある " の文字は含めずに入力してください。'}</p>
                    <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                        {firebaseConfigKeys.map(key => {
                            const value = configState.NEXT_PUBLIC_FIREBASE_CONFIG[key];
                            let placeholder: string;
                            switch (key) {
                                case apiKey:
                                    placeholder = 'exampleABCdef-1234ABcd5678-abCD-12EF';
                                    break;
                                case authDomain:
                                    placeholder = 'my-flocon-server.firebaseapp.com';
                                    break;
                                case projectId:
                                    placeholder = 'my-flocon-server';
                                    break;
                                case storageBucket:
                                    placeholder = 'my-flocon-server.appspot.com';
                                    break;
                                case messagingSenderId:
                                    placeholder = '123456789012';
                                    break;
                                case appId:
                                    placeholder = '1:123456789012:web:739b84a062e07ccb775b8a';
                                    break;
                            }
                            return (
                                <Form.Item
                                    key={key}
                                    label={key}
                                    validateStatus={isEmptyString(value) ? 'error' : undefined}
                                    help={
                                        isEmptyString(value)
                                            ? ErrorMessages.mustNotBeEmpty
                                            : undefined
                                    }
                                >
                                    <Input
                                        onChange={e =>
                                            setConfigStateWithImmer(configState => {
                                                configState.NEXT_PUBLIC_FIREBASE_CONFIG[key] =
                                                    e.target.value;
                                            })
                                        }
                                        value={value}
                                        placeholder={`例: ${placeholder}`}
                                    />
                                </Form.Item>
                            );
                        })}
                    </Form>
                    <Collapse style={{ marginTop: collapsePadding }}>
                        <Collapse.Panel header="Firebase構成オブジェクトを確認する方法" key="1">
                            <div>
                                <div>
                                    Firebase構成オブジェクトは、Firebase管理画面から歯車アイコンをクリックして「プロジェクトの設定」を開き、下の画像の赤い四角形の部分から参照できます。
                                </div>
                                <Image
                                    width={400}
                                    src="/assets/firebase-config.png"
                                    alt="Firebase構成オブジェクト"
                                    preview={{ mask: '拡大する' }}
                                />
                            </div>
                        </Collapse.Panel>
                    </Collapse>
                    <h2 style={{ paddingTop: headerPadding }}>
                        Firebase Authenticationで有効化したログインプロバイダ
                    </h2>
                    <Checkbox
                        value={configState.NEXT_PUBLIC_AUTH_PROVIDERS.email}
                        onChange={e => {
                            setConfigStateWithImmer(configState => {
                                configState.NEXT_PUBLIC_AUTH_PROVIDERS.email = e.target.checked;
                            });
                        }}
                    >
                        メール/パスワード
                    </Checkbox>
                    <Checkbox
                        value={configState.NEXT_PUBLIC_AUTH_PROVIDERS.phone}
                        onChange={e => {
                            setConfigStateWithImmer(configState => {
                                configState.NEXT_PUBLIC_AUTH_PROVIDERS.phone = e.target.checked;
                            });
                        }}
                    >
                        電話番号
                    </Checkbox>
                    <Checkbox
                        value={configState.NEXT_PUBLIC_AUTH_PROVIDERS.anonymous}
                        onChange={e => {
                            setConfigStateWithImmer(configState => {
                                configState.NEXT_PUBLIC_AUTH_PROVIDERS.anonymous = e.target.checked;
                            });
                        }}
                    >
                        匿名
                    </Checkbox>
                    <Checkbox
                        value={configState.NEXT_PUBLIC_AUTH_PROVIDERS.google}
                        onChange={e => {
                            setConfigStateWithImmer(configState => {
                                configState.NEXT_PUBLIC_AUTH_PROVIDERS.google = e.target.checked;
                            });
                        }}
                    >
                        Google
                    </Checkbox>
                    <Checkbox
                        value={configState.NEXT_PUBLIC_AUTH_PROVIDERS.facebook}
                        onChange={e => {
                            setConfigStateWithImmer(configState => {
                                configState.NEXT_PUBLIC_AUTH_PROVIDERS.facebook = e.target.checked;
                            });
                        }}
                    >
                        Facebook
                    </Checkbox>
                    <Checkbox
                        value={configState.NEXT_PUBLIC_AUTH_PROVIDERS.twitter}
                        onChange={e => {
                            setConfigStateWithImmer(configState => {
                                configState.NEXT_PUBLIC_AUTH_PROVIDERS.twitter = e.target.checked;
                            });
                        }}
                    >
                        Twitter
                    </Checkbox>
                    <Checkbox
                        value={configState.NEXT_PUBLIC_AUTH_PROVIDERS.github}
                        onChange={e => {
                            setConfigStateWithImmer(configState => {
                                configState.NEXT_PUBLIC_AUTH_PROVIDERS.github = e.target.checked;
                            });
                        }}
                    >
                        GitHub
                    </Checkbox>
                    {AuthProviders.isEmpty(configState.NEXT_PUBLIC_AUTH_PROVIDERS) && (
                        <Alert
                            showIcon
                            type="error"
                            message="少なくとも1つにチェックを入れる必要があります。もしログインプロバイダを1つも有効化していない場合は、Firebaseの管理画面にアクセスして少なくとも1つを有効化してください。"
                        />
                    )}
                    <Collapse style={{ marginTop: collapsePadding }}>
                        <Collapse.Panel header="有効化したログインプロバイダを確認する方法" key="1">
                            <div>
                                <div>
                                    有効化したログインプロバイダは、Firebase
                                    Authenticationの管理画面から参照できます。公式ドキュメントに従ってサーバーをセットアップしている場合は、おそらく下の画像のようになっていると思います。この画像では「メール/パスワード」と「Google」が有効化されています。
                                </div>
                                <Image
                                    width={400}
                                    src="/assets/firebase-auth-2.png"
                                    alt="ログインプロバイダの画像1"
                                    preview={{ mask: '拡大する' }}
                                />
                                <div>
                                    ログインプロバイダを1つも有効化していない場合は、下の画像のようになります。この場合は少なくとも1つを有効化してください。
                                </div>
                                <Image
                                    width={400}
                                    src="/assets/firebase-auth-1.png"
                                    alt="ログインプロバイダの画像2"
                                    preview={{ mask: '拡大する' }}
                                />
                            </div>
                        </Collapse.Panel>
                    </Collapse>
                    <h2 style={{ paddingTop: headerPadding }}>APIサーバーのURL（http, https）</h2>
                    <Form>
                        <Form.Item
                            validateStatus={
                                isEmptyString(configState.NEXT_PUBLIC_API_HTTP)
                                    ? 'error'
                                    : undefined
                            }
                            help={
                                isEmptyString(configState.NEXT_PUBLIC_API_HTTP)
                                    ? ErrorMessages.mustNotBeEmpty
                                    : undefined
                            }
                        >
                            <Input
                                onChange={e =>
                                    setConfigStateWithImmer(configState => {
                                        configState.NEXT_PUBLIC_API_HTTP = e.target.value;
                                    })
                                }
                                value={configState.NEXT_PUBLIC_API_HTTP}
                                placeholder="例: https://example.com"
                            />
                        </Form.Item>
                    </Form>
                    <h2 style={{ paddingTop: headerPadding }}>APIサーバーのURL（ws, wss）</h2>
                    <Checkbox
                        checked={autoWsState}
                        onChange={newValue => {
                            setAutoWsState(newValue.target.checked);
                        }}
                    >
                        「APIサーバーのURL（http, https）」から自動的に推測する（推奨）
                    </Checkbox>
                    {autoWsState ? (
                        <Input disabled value={autoWsUrl} />
                    ) : (
                        <Form>
                            <Form.Item
                                validateStatus={
                                    isEmptyString(configState.NEXT_PUBLIC_API_WS)
                                        ? 'error'
                                        : undefined
                                }
                                help={
                                    isEmptyString(configState.NEXT_PUBLIC_API_WS)
                                        ? ErrorMessages.mustNotBeEmpty
                                        : undefined
                                }
                            >
                                <Input
                                    onChange={e =>
                                        setConfigStateWithImmer(configState => {
                                            configState.NEXT_PUBLIC_API_WS = e.target.value;
                                        })
                                    }
                                    value={configState.NEXT_PUBLIC_API_WS}
                                    placeholder="例: wss://example.com"
                                />
                            </Form.Item>
                        </Form>
                    )}
                    <h2 style={{ paddingTop: headerPadding }}>
                        Firebase Storage版アップローダーを有効化する
                    </h2>
                    <Checkbox
                        checked={configState.NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED}
                        onChange={e => {
                            setConfigStateWithImmer(configState => {
                                configState.NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED = e.target.checked;
                            });
                        }}
                    >
                        有効化する
                    </Checkbox>
                </div>
                <div style={{ padding: '0 24px', alignSelf: 'center', fontSize: 24 }}>{'⇒'}</div>
                <div style={{ flex: 1 }}>
                    <div>
                        <h3>注意</h3>
                        左半分のエリアでエラーが出ていないことを確認してください。
                        <h3 style={{ paddingTop: headerPadding }}>デプロイ方法</h3>
                        <Radio.Group
                            onChange={e => {
                                setDeployType(e.target.value);
                            }}
                            value={deployType}
                        >
                            <Space direction="vertical">
                                <Radio value={staticFiles}>
                                    静的ファイル（例: Netlifyのドラッグ＆ドロップによるデプロイ）
                                </Radio>
                                <Radio value={nextjs}>Next.js（例: Vercel）</Radio>
                            </Space>
                        </Radio.Group>
                        <h3 style={{ paddingTop: headerPadding }}>設定方法</h3>
                        {deployType === staticFiles ? (
                            <>
                                {
                                    'まず、下のテキストをコピーしてoutフォルダ内にあるenv.txtに貼り付けて保存してください。次に、そのenv.txtファイルが入っているoutフォルダの中身をすべてホスティングサイトにアップロードしてください（Netlifyのドラッグ＆ドロップによるデプロイを行う場合は、outフォルダをドラッグ＆ドロップしてください）。'
                                }
                                <Input.TextArea
                                    style={{ resize: 'none', height: 300, marginTop: 24 }}
                                    readOnly
                                    value={envTxt ?? ''}
                                />
                            </>
                        ) : (
                            <>
                                ホスティングサイトの設定画面を開き、次のように環境変数を設定してください。
                                <Table
                                    columns={[
                                        { title: 'キー', dataIndex: 'key', key: 'key' },
                                        {
                                            title: '値',
                                            dataIndex: 'value',
                                            key: 'value',
                                            render: value => (
                                                <div style={{ lineBreak: 'anywhere' }}>{value}</div>
                                            ),
                                        },
                                    ]}
                                    dataSource={envTableDataSource}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
