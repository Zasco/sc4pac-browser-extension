# sc4pac browser extension
A browser extension to integrate *sc4pac* to *SimCity 4* file exchanges.

## Description
This browser extension adds buttons to a *SimCity 4* plugin page that trigger actions on [**sc4pac**](https://github.com/memo33/sc4pac-gui).

## Package mapping sources
The mapping between exchange packages and sc4pac packages is sourced from [sebamarynissen/sc4pac-helpers](https://github.com/sebamarynissen/sc4pac-helpers) repository. The extension uses these lists to map exchange files to their corresponding *sc4pac* package ID:

- [*Simtropolis*](https://github.com/sebamarynissen/sc4pac-helpers/blob/main/lib/data/st.js)
- [*SC4Evermore*](https://github.com/sebamarynissen/sc4pac-helpers/blob/main/lib/data/sc4e.js)
  - [BSC](https://github.com/sebamarynissen/sc4pac-helpers/blob/main/lib/data/deps-bsc.js)
  - [Girafe](https://github.com/sebamarynissen/sc4pac-helpers/blob/main/lib/data/deps-girafe.js)

## Features
- One-click installation buttons on supported *SimCity 4* exchange sites
- Direct integration with *sc4pac* package manager
- Settings configuration for sc4pac server connection (hostname and port)

## Supported exchanges
- *Simtropolis*
- *SC4Evermore*

Each exchange provides:
- Direct download integration
- One-click installation through *sc4pac*
- Package dependency management

## Installation
1. Download the latest release from the releases page
2. Install the extension in your browser
3. Ensure *sc4pac* is installed on your system and its API server is running
4. Configure the server hostname and port in the extension settings
5. Add channels in the extension settings as required

## Usage
Visit a supported file exchange page to see the sc4pac integration buttons:
- View Package: Opens the package in sc4pac
- Add Package: Installs the package using sc4pac

## Requirements
- *sc4pac* installed and working
- Modern web browser (*Chrome*, *Firefox*, *Edge*)

## Configuration
The extension requires the following settings to connect to your *sc4pac* server:

- Server hostnname: The hostname where *sc4pac* API server is running (default: **localhost**)
- Port: The port number which *sc4pac* API server is running (default: **51515**)

You can configure these settings through the extension's options page in your browser:
1. Click the extension icon in your browser
2. Select "Options" or "Settings"
3. Enter your *sc4pac* server hostname and port
4. Click Save

This ensures the extension can communicate with your local *sc4pac* installation.

## TO-DO
- Support multiple *sc4pac* packages per exchange file
  - Update package mapping structure
  - Update UI to show all available packages
- Add support for more *SimCity 4* exchanges
  - [ToutSimCities](https://www.toutsimcities.com)
- Swap add/remove buttons.
- Use configuration from profiles.
- Add server API version support.
- Use file IDs from channels instead of from **sebarynissen/sc4pac-helpers**.
- Add caching of fetched contents.

### Package reference detection
- Implement scanning of comments and files description for package with detection from
  - Package ID pattern (group:name)
  - File URL
- Add inline buttons next to matched references
- Implementation steps:
  1. Create regex pattern matcher for package ID
  2. Scan text content for matches
  3. For each match:
     - Verify existence in sc4pac package list
     - Create inline button group using `buttonHelper.createButtonGroup()`
     - Position buttons next to matched text
     - Update button URLs using `buttonHelper.updateButtonHref()`

Technical considerations:
- Reuse existing button creation logic from `buttonHelper.js`
- Maintain consistent button styling and behavior
- Handle multiple matches in same description
- Consider performance impact of regex scanning

## Contributing
Contributions are welcome! Feel free to submit issues and pull requests.