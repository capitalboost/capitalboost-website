# Deploy — capitalboost.ro

Rădăcina acestui repo este ceea ce ajunge în `public_html`. Un push pe `main` publică
direct în producție; nu există staging.

```
push pe main
  └─> .github/workflows/deploy.yml
        ├─> UAPI VersionControl/update             (pull pe cPanel)
        ├─> verifică HEAD-ul cPanel == GITHUB_SHA
        └─> UAPI VersionControlDeployment/create   (rulează .cpanel.yml)
              └─> cp -r <repo> → public_html
```

## ⚠️ Auto-deploy-ul e pe jumătate stricat

`VersionControl/update` răspunde „succes" dar **nu execută pull-ul** (testat: 12 reîncercări
în 60 de secunde, HEAD-ul serverului n-a mișcat).

**După fiecare push**, intră în cPanel → Git™ Version Control → *Pull or Deploy* și apasă
**Update from Remote**, apoi **Deploy HEAD Commit**.

Pasul de verificare din workflow compară HEAD-ul cPanel cu `GITHUB_SHA` și pică roșu dacă nu
se potrivesc. **Nu-l scoate** — fără el, un pull care nu avansează raportează succes iar
deploy-ul recopiază la nesfârșit fișierele vechi. Exact așa s-a pierdut o zi pe 20 august 2026.

## Calea repo-ului: trei locuri care trebuie să coincidă

Actuală: `/home/capitalboost/repositories/capitalboost-web`

1. `.cpanel.yml` — linia cu `cp -r`
2. `.github/workflows/deploy.yml` — variabila `REPO_DIR`
3. cPanel → Git™ Version Control → *Repository Path*

Dacă reclonezi repo-ul pe server, **nu refolosi o cale la care a mai existat unul**: ștergerea
intrării din cPanel nu șterge și directorul de pe disc, iar clonarea dă „directory already
contains files".

Nu face `--amend` sau rebase pe commit-uri deja împinse. Clona de pe cPanel trage cu
`pull --ff-only`; dacă istoria diverge, nu mai poate avansa niciodată și deploy-urile devin
tăcute și inutile.

## Cookie consent

Microsoft Clarity (`y5acfoiywc`) se încarcă **doar după acceptul vizitatorului**, prin
`js/cookie-consent.js`. Nu adăuga tag-ul inline în pagini.

Butoanele „Refuz" și „Accept" trebuie să rămână la fel de vizibile — dacă refuzul devine mai
greu de apăsat, consimțământul nu mai e valid și bannerul își pierde rostul.

## Commit-uri

Autor: **CapitalBoost**, fără nicio altă atribuire. Fără `Co-Authored-By`, fără „Generated
with". Mesaje în română.

## Server

| | |
|---|---|
| IP | 185.246.122.88 |
| User | capitalboost |
| Docroot | /home/capitalboost/public_html |

`capitalboost.ro` e în spatele Cloudflare — nu-l folosi pentru conexiuni directe. SSH e
închis pe toate porturile uzuale; ar trebui cerut de la suportul hosterului.

---

Context complet, inclusiv lista de lucruri rămase de făcut:
`Updates/2026-08-20 — Clarity, GDPR și Portofoliu.md` (în Google Drive, nu în repo).
