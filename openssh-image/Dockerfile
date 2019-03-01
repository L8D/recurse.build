FROM alpine:3.7
RUN apk add --no-cache openssh
COPY sshd_config /etc/ssh/sshd_config
ENTRYPOINT ["/usr/sbin/sshd"]
