FROM alpine:3.7
RUN apk add --no-cache openssh

# TODO: stop doing this
#
#       this means that our private keys are generated at build time.  it also
#       means that our private keys are in the docker image, and anyone
#       connected to the docker registry can download the image and read what
#       has been built.
#
#       it also means that a new key will be generated when this section of the
#       Dockerfile changes. we want reproducible builds, and this is generating
#       random content. When upgrading the docker image, users will lose trust
#       with the SSH server because of the new host key mismatch.
RUN ssh-keygen -A

COPY sshd_config /etc/ssh/sshd_config
COPY authorized-keys /etc/ssh/authorized-keys

CMD ["/usr/sbin/sshd", "-dD"]
