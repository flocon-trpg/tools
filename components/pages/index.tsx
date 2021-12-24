import { NextPage } from 'next';
import Link from 'next/link';

export const Index: NextPage = () => {
    return (
        <div style={{ padding: 16 }}>
            <h2>Floconツール</h2>
            <Link href="/web-server">Webサーバーの設定を作成する</Link>
        </div>
    );
};
