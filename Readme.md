### Start server
```sh
cd app
DATABASE_URL="postgresql://postgres:password@localhost:5432/study-sync" PORT=4567 npm start
```
# Run Postgres Server
```sh
docker compose up
```
## Install postgress client (Mac)
```sh
brew install postgresql@16 
brew services start postgresql@16
```

## Create initial database
```sh
createdb study-sync -h localhost -U postgres
```

## Connect to Postgres Client
```sh
psql postgresql://postgres:password@localhost:5432/study-sync
```
## Create schema
```sh
psql study-sync < sql/schema.sql -h localhost -U postgres
```


## Import data

```sh
psql study-sync < sql/seed.sql -h localhost -U postgres

```

## Install EB CLI
git clone https://github.com/aws/aws-elastic-beanstalk-cli-setup.git

Success!

    Note: To complete installation, ensure `eb` is in PATH. You can ensure this by executing:

    1. Bash:

       echo 'export PATH="/Users/ishumadan/.ebcli-virtual-env/executables:$PATH"' >> ~/.bash_profile && source ~/.bash_profile

    2. Zsh:

       echo 'export PATH="/Users/ishumadan/.ebcli-virtual-env/executables:$PATH"' >> ~/.zshenv && source ~/.zshenv

## EB Init
```
eb init
```sh

## Setup code commit
```
eb codesource
```sh
