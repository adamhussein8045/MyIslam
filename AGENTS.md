<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep Quran metadata and numbered authentic page pointers separate from reader UI; this preserves verified scripture and makes completeness testable.
- Keep GitHub Pages in its own build configuration and publish only prerendered client files; Lovable continues to run at its root URL.
- Resolve public assets through Vite BASE_URL; both root hosting and /MyIslam/ must work without changing source paths.
- Cache only visited Mushaf pages with a bounded service-worker cache; never download the full Quran on app startup.
