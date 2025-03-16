# Quick Start Guide
This guide is for configuring your Windows machine to run the Clueless server.


1. Install [pyenv-win](https://github.com/pyenv-win/pyenv-win/tree/master) in PowerShell (highly recommended).

    Read through the *README*. If you have trouble installing pyenv, make sure to run PowerShell as an administrator and run the below commands.

    ```pwsh
    > Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine

    > Invoke-WebRequest -UseBasicParsing -Uri "https://raw.githubusercontent.com/pyenv-win/pyenv-win/master/pyenv-win/install-pyenv-win.ps1" -OutFile "./install-pyenv-win.ps1"; &"./install-pyenv-win.ps1"
    ```

2. Install Python using the below commands. *Flask* will work with Python 3.9* and newer.

    ```pwsh
    # List all available Python versions
    > pyenv install --list

    # Install Python 3.13.2
    > pyenv install 3.13.2

    # Set Python 3.13.2 as the global Python version
    > pyenv global 3.13.2

    # Check which Python version is set as global
    > pyenv global

    # Check Python version (should match global)
    > python -V

3. Install Flask and other packages

    ```pwsh
    python -m pip install Flask
    python -m pip install flask-socketio
    ```

    Since *pip* may already be installed on your system in the local packages, using *python -m* will ensure that the installed package is for your global Python version as set by *pyenv*.

4. To run the program, start the server by running server/main.py Then open client/index.html instances for each player (have to be seperate browsers).