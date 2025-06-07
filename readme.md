# T Web scripts

This project wishes to build a collection of scripts for Tampermonkey.
The shared parts can be easier managed into one repo.

Currently, the only script is MWI helper.

## MWI helper

The MWI has 3 parts:

* **Engine** to consume the data from MWI and provide the data API.
* **View** to render the information to the MWI
* **Plugin** to load the data and provide the view.

Then, also need to provide more support tools:

* **Setting** for customize the configuration and share to others.
* **Lifecycle** for the plugin to run at the right time.

## Technologies

To make sure the code is well-managed, the repo uses [TypeScript](https://www.typescriptlang.org/) for codebase.
To simplify the development process, the repo uses [Rollup](https://rollupjs.org/) to build the script.

* Due to the TypeScript can process the JSX, the Babel is not required.
* Currently, all dependencies are bundled into one file.
  The plan is to manage external dependencies into Tampermonkey.

To simplify the UI code, the repo uses [React](https://reactjs.org/) for UI.

* Due to the Preact doesn't have too many community components, the repo chooses React.