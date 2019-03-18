#!/bin/sh -ex

USERNAME=$1

if ! id -u $USERNAME ; then
  # login is only available with keys, so passwords are not important
  # see https://stackoverflow.com/a/25211719/1411500
  adduser -D $USERNAME
  passwd $USERNAME -ud
fi

mkdir -p -m 0755 /etc/ssh/authorized-keys
mkdir -p -m 0600 /home/$USERNAME/.ssh
tee /etc/ssh/authorized-keys/$USERNAME /home/$USERNAME/.ssh/authorized_keys <&0
chmod 0700 /home/$USERNAME/.ssh/authorized_keys
chown -R $USERNAME /home/$USERNAME/.ssh

chmod 0755 /etc/ssh/authorized-keys/$USERNAME
chmod 0755 /etc/ssh/authorized-keys
