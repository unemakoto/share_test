document.addEventListener('DOMContentLoaded', function () {
  // -----------------------------------------------------------
  // `?kiji_id=XXX?iref=YYY` のような誤ったURLを `?kiji_id=XXX&iref=YYY` に修正
  // -----------------------------------------------------------
  let url = window.location.href;
  url = url.replace(/(\?kiji_id=[^?]*)\?(iref=[^&]*)/, "$1&$2");
  // リロードせずにURLを変更
  window.history.replaceState(null, null, url);


  // -----------------------------------------------------------
  // ページアクセス時にkiji_idクエリがあったら所望の位置へ遷移（#でなく?でのアンカーリンク動作）
  // https://wwwcdn.asahi.com/une-test/saigai/share-test/test1/?kiji_id=AST2N4GBXT2NUCVL037M
  // -----------------------------------------------------------
  const params = new URLSearchParams(window.location.search);
  const kijiId = params.get("kiji_id"); // クエリの"kiji_id"の値を取得
  if (kijiId) {
    const targetElement = document.querySelector(`.infoWrap ul li[id='${kijiId}']`);
    if (targetElement) {
      // 該当セクションまで移動
      // targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      targetElement.scrollIntoView({ block: "start" });

      // // URLのハッシュを更新（履歴に残さずに変更）
      // history.replaceState(null, null, `#${kijiId}`);
    }
  }


  // -----------------------------------------------------------
  // 個別シェアボタンのクリック処理
  // -----------------------------------------------------------
  let my_query = null;
  let info_midashi = null;
  // buttonタグのすぐ上のaタグのhrefを取得
  document.querySelectorAll('.infoBtn').forEach((button) => {
    button.addEventListener('click', function () {
      // ボタンと同じ<li>要素を取得
      const liElement = this.closest('li');
      if (liElement) {
        // <li>内の最初の<a>タグを取得
        const aTag = liElement.querySelector('a');

        // <li>内のh2タグのテキストを取得
        const h2Element = liElement.querySelector('.infoMidashi h2');
        if (h2Element) {
          info_midashi = h2Element.textContent;
          // 改行など追加
          info_midashi = `“${info_midashi}”\n`;
        }

        if (aTag) {
          const href = aTag.getAttribute('href');
          // aタグの記事IDの部分だけを抽出
          const _tmp = /\/articles\/(.*?)\.html/;
          const match = href.match(_tmp);
          if (match && match[1]) {
            const kiji_id = match[1];
            console.log(`記事ID：${kiji_id}`);
            my_query = `?kiji_id=${kiji_id}`;
          }

          // data-share-url 属性から下層ページのパスを取得（hrefの値をそのまま取得がよさそう）
          const shareUrl = liElement.getAttribute('data-share-url');

          tweet3(shareUrl, info_midashi);
          // tweet(my_query);
        }

      }
    });
  });

  // -----------------------------------------------------------
  // 独自のシェア用の関数
  // -----------------------------------------------------------
  function tweet3(shareUrl, info_midashi) {
    // 下層ページのURL（絶対パス推奨）
    const baseURL = "https://wwwcdn.asahi.com/une-test/saigai/share-test/test2/";
    const fullURL = baseURL + shareUrl;

    // Twitter intent の組み立て
    const intentBase = "https://twitter.com/intent/tweet?";
    const urlParam = "url=" + encodeURIComponent(fullURL);
    const textParam = "&text=" + encodeURIComponent(info_midashi);

    // 必要に応じてハッシュタグや参照元を追加
    // 例: const hashtagParam = "&hashtags=" + encodeURIComponent("ウクライナ問題,朝日新聞");
    // 例: const refParam = "&original_referer=" + encodeURIComponent(fullURL);

    // 組み立て（ここでは textParam だけにしています）
    const tweetUrl = intentBase + urlParam + textParam;

    // singlepage_element.jsの仕様
    let _tw_window_pos_w = (screen.width - 600) / 2;
    let _tw_window_pos_h = (screen.height - 330) / 2.5;

    const env = fnc_environment();
    if (env[1] === 'iphone' || env[1] === 'android' || env[1] === 'ipad') {
      window.open(tweetUrl, '_blank');
    } else {
      window.open(tweetUrl, "WindowName", "width=600,height=330,resizable=yes,scrollbars=yes, top=" + _tw_window_pos_h + ",left=" + _tw_window_pos_w + "");
    }

    // // ポップアップで開く（モバイルの場合など、別タブを開く処理に分岐してもOK）
    // window.open(
    //   tweetUrl,
    //   "_blank",
    //   "width=600,height=330,resizable=yes,scrollbars=yes"
    // );

    return false;
  }

});
