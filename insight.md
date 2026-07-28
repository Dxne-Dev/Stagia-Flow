Voici la **synthèse finale combinée** (Vue Bureau & Vue Mobile) issue des derniers tests PageSpeed Insights pour votre site [stage-pilot-six.vercel.app](https://www.google.com/search?q=https://stage-pilot-six.vercel.app), suivie du **plan d'action ciblé pour viser le 100/100 partout**.

---

## 📊 Tableau Comparatif Final : Bureau vs Mobile

| Critère / Métrique | Vue Bureau | Vue Mobile (4G lente) | Statut & Diagnostic |
| --- | --- | --- | --- |
| **Score Performances** | **92 / 100** 🟢 | **60 / 100** 🟠 | 🔻 **Déficit de -32 pts sur mobile** (temps de réseau/exéc) |
| **Accessibilité** | **92 / 100** 🟢 | **92 / 100** 🟢 | 🟢 Net progrès (+6 pts) — Reste de légers détails |
| **Bonnes pratiques** | **96 / 100** 🟢 | **96 / 100** 🟢 | 🟢 Excellent niveau global |
| **SEO** | **91 / 100** 🟢 | **91 / 100** 🟢 | 🟢 Très bon référencement naturel |
| **FCP** *(First Contentful Paint)* | **1,2 s** 🟢 | **6,9 s** 🔴 | 🔻 Écart de 5,7 s dû au téléchargement du JS en 4G |
| **LCP** *(Largest Contentful Paint)* | **1,3 s** 🟢 | **7,3 s** 🔴 | 🔻 Le composant principal attend la fin du chargement JS |
| **TBT** *(Total Blocking Time)* | **0 ms** 🟢 | **0 ms** 🟢 | 🟢 **Parfait !** Thread principal 100% réactif |
| **CLS** *(Cumulative Layout Shift)* | **0.002** 🟢 | **0.016** 🟢 | 🟢 **Excellente stabilité visuelle** |

---

## 🎯 Feuille de Route pour passer de 92/60 à 100%

### 1. Performance Web (Viser 100/100 sur Bureau & Mobile)

* **Code-Splitting dynamique sur le JavaScript (`~140 KiB` d'économie)**
* *Problème :* Le bundle principal `index-_Qt6sfjO.js` (186 KiB) et le fichier `landing-D_QWJTE6.js` (50 KiB) contiennent **140 KiB de code non utilisé** au chargement de la page d'accueil.
* *Solution :* Utilisez des `import()` dynamiques / `React.lazy()` dans votre bundler (Vite/Next/Webpack) pour diviser vos composants lourds (dashboards, formulaires avancés, modales) et ne charger que le strict nécessaire sur la landing page.


* **Consolidation des micro-fichiers d'icônes (Chaîne de requêtes critiques)**
* *Problème :* La latence du chemin critique atteint **1,6 s** car le navigateur télécharge en cascade plein de petits fichiers d'icônes JS (`check-CstXRte9.js`, `arrow-right-DfpRjTxo.js`, `sparkles-8J5cL8kk.js`, `shield-NwRlal_4.js`).
* *Solution :* Regroupez ces petites icônes/composants SVG directement dans le bundle principal ou sous forme de sprite SVG pour réduire les allers-retours réseau.



---

### 2. Accessibilité (Passer de 92 à 100/100)

* **Agrandir les zones cibles tactiles (Mobile)**
* *Problème :* Les boutons de pagination/étapes (`Voir l'étape 1`, `Voir l'étape 2`, etc.) ont des dimensions physiques trop petites (`h-1.5`, `w-1.5` ou `w-6`), ce qui rend le clic difficile au doigt.
* *Solution :* Ajoutez une zone d'interaction transparente autour avec la propriété CSS `min-h-[44px] min-w-[44px]` ou du padding invisible (`p-3`).


* **Ajuster le contraste des liens secondaires (Footer)**
* *Problème :* La classe `text-muted-foreground/70` appliquée sur les liens du pied de page (`Fonctionnalités`, `Tarifs`, `CGU`, etc.) manque légèrement de contraste par rapport au fond `bg-card`.
* *Solution :* Supprimez l'opacité `/70` et utilisez directement `text-muted-foreground` pour garantir un ratio de contraste d'au moins **4.5:1** (WCAG AA).


* **Corriger l'alternative textuelle redondante (`alt`)**
* *Problème :* Le logo `<img alt="StagePilot" src="/logo.ico">` possède un texte `alt` identique au nom "StagePilot" situé juste à côté. Le lecteur d'écran répète le mot deux fois.
* *Solution :* Passez l'attribut à `alt=""` (image décorative) si le texte "StagePilot" est déjà présent en HTML à côté.