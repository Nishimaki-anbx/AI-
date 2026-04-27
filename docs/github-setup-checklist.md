# GitHub セットアップチェックリスト

このチェックリストでは、GitHub 上で有効にしておくとよいリポジトリ設定をまとめます。
一部の設定はローカルファイルだけでは強制できないため、このドキュメントを手動セットアップのガイドとして使います。

## 1. ブランチ保護

対象ブランチ: `main`

推奨設定:

- マージ前に Pull Request を必須にする
- 必要な承認数: 1
- 新しいコミットが push されたら古い Pull Request 承認を取り消す
- マージ前にステータスチェックの成功を必須にする
- マージ前に会話の解決を必須にする
- `main` への直接 push を制限する

## 2. マージ設定

推奨設定:

- squash merge を許可: on
- merge commit を許可: off
- rebase merge を許可: off
- head branch の自動削除: on

## 3. 一般的なリポジトリ設定

推奨設定:

- Issues: on
- Projects: 任意
- Discussions: 学習メモを残したい場合は任意
- Wikis: 任意。多くの場合は off のままで問題ありません

## 4. セキュリティと自動化

推奨設定:

- Dependabot alerts: on
- Dependabot security updates: on
- Secret scanning: on
- Private vulnerability reporting: 任意

## 5. ラベル

初期ラベルの候補:

- `type:feature`
- `type:bug`
- `type:docs`
- `type:chore`
- `priority:high`
- `priority:medium`
- `priority:low`
- `ai-assisted`

## 6. 練習時のルール

練習用リポジトリでも、次のルールを守ると運用しやすくなります。

- `main` に直接コミットしない
- Issue または Pull Request に意図を残す
- すべての Pull Request に検証手順を記録する
- AI 支援による変更の最終責任は人間のレビュー担当者が持つ
