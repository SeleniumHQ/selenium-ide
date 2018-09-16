## Adding New Icons as Fonts to Selenium IDE

1. Visit the [IcoMoon App](https://icomoon.io/app/#/select)
2. Click `Import Icons`
3. Select `selenium-ide.json` from `packages/selenium-ide/fonts` and click `Load`
4. Once loaded, all of the project's icons will be listed under a collection called `Untitled Set`. Click the hamburger menu icon at the top-right of the collection and select `Import to Set`
5. Choose the SVG files for the new icons you want to add to the project
6. Click the hamburger menu icon at the top-right of the collection again and select `Download JSON`
7. Save the file to `packages/selenium-ide/fonts/selenium-ide.json` (over-writing the existing file)
8. On the bottom of the `IcoMoon App` screen click `Generate Font` and then click `Download`
9. Unzip the downloaded file and open up the `fonts` folder
10. Move `selenium-ide.svg` and `selenium-ide.ttf` into `packages/selenium-ide/src/neo/assets/fonts`, overwriting the files of the same name
11. Go back to the downloaded files and open `style.css`
12. Also open `packages/selenium-ide/src/neo/styles/font.css`
13. Between the two, identify the newly added styles for the icons you just uploaded, and copy the new entries from `style.css` into `font.css`
14. Remove any `color` styling from these entries and save `font.css`
15. Discard what's left of the downloaded files
16. Commit and push your changes to the repo
