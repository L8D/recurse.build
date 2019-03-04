#!/bin/sh -ex

chmod -R 0647 /etc/ssh/authorized-keys

for user in $(ls /etc/ssh/authorized-keys); do
  # login is only available with keys, so passwords are not important
  # see https://stackoverflow.com/a/25211719/1411500
  adduser -D $user
  passwd $user -ud

  # maybe these steps are needed. ¯\_(ツ)_/¯ 
  su $user -l -c 'sh -ex' << EOF
mkdir .ssh
cp /etc/ssh/authorized-keys/\$USER .ssh/authorized_keys
chmod 0700 .ssh
chmod 0600 .ssh/authorized_keys
EOF
  chmod 0755 /etc/ssh/authorized-keys/$user
done

chmod 0755 /etc/ssh/authorized-keys
