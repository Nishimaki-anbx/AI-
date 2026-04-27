# AI-

このリポジトリは、AI を活用した開発を練習するための場所です。

初期設定では、GitHub を中心にしたシンプルなワークフローに焦点を当てています。

- Issue で作業内容を定義する
- AI の支援を受けながら小さく変更する
- Pull Request に意図と検証内容を記録する
- GitHub Actions で基本的な自動チェックを実行する

このリポジトリは、ドキュメントとワークフローを支えるファイルから始めます。
コード、サンプル、実験用の内容は、基本プロセスを変えずに後から追加できます。

## はじめ方

1. [CONTRIBUTING.md](CONTRIBUTING.md) を読む
2. Issue を作成する、または既存の Issue を選ぶ
3. `main` からブランチを作成する
4. AI の支援を受けながら小さな変更を行う
5. テンプレートを使って Pull Request を作成する
6. レビューと CI の後に `main` へマージする

## ドキュメント

- [CONTRIBUTING.md](CONTRIBUTING.md): 日々の作業フロー
- [docs/github-setup-checklist.md](docs/github-setup-checklist.md): 推奨する GitHub 設定
- [docs/ai-development-playbook.md](docs/ai-development-playbook.md): AI 支援作業の実践ガイド
- [docs/design/task-agent-mvp.md](docs/design/task-agent-mvp.md): タスク管理エージェント MVP の設計メモ

## タスク管理エージェント MVP

ローカル JSON 保存の CLI として、最初のタスク管理エージェントを実装しています。

```powershell
node bin/task-agent.js add "README を見直す" --priority medium
node bin/task-agent.js list
node bin/task-agent.js update task-001 --status doing
node bin/task-agent.js note task-001 "対応方針を確認した"
node bin/task-agent.js show task-001
```

既定の保存先は `.task-agent/tasks.json` です。
別の保存先を使う場合は `--data-file path/to/tasks.json` を指定します。

## 初期方針

- 変更は小さくし、Pull Request は短期間で完了させる
- できるだけ Issue から始める
- PR には AI の利用内容と人間による検証内容の両方を記録する
- 繰り返し実行するチェックは GitHub Actions に移す
