import { NextPage } from 'next';
import Link from 'next/link';

export const Index: NextPage = () => {
    return (
        <div style={{ padding: 16 }}>
            <h2>Floconツール</h2>
            <p>
                <Link href="/web-server">Webサーバーの設定を作成する</Link>
            </p>
            <p>
                <Link href="/bcrypt">エントリーパスワードに用いるbcryptハッシュを生成する</Link>
            </p>
            <h2>その他</h2>
            <a
                href="https://github.com/flocon-trpg/tools"
                target="_blank"
                rel="noopener noreferrer"
            >
                ソースコード
            </a>
        </div>
    );
};
