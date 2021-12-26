import { NextPage } from 'next';
import Link from 'next/link';

export const Index: NextPage = () => {
    return (
        <div style={{ padding: 16 }}>
            <h2>Floconツール</h2>
            <Link href="/web-server">Webサーバーの設定を作成する</Link>
            <h2>その他</h2>
            <a href="https://github.com/flocon-trpg/docs" target="_blank" rel="noopener noreferrer">
                ソースコード
            </a>
        </div>
    );
};
