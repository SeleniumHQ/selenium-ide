### ASSUMPTIONS:
# You have NodeJS, npm, and yarn installed

# Getting and installing pip
sudo apt update;
sudo apt install python3-pip;
# Getting peru
pip3 install peru;
# Using peru to sync our atoms
peru sync;
# Monorepo install command
yarn;
# Monorepo build command
yarn build;
# For fully minified build, use this:
# yarn build:ext:prod;