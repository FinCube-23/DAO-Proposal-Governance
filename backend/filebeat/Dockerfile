FROM docker.elastic.co/beats/filebeat:8.4.1

WORKDIR /usr/share/filebeat
# Copy our custom configuration file
COPY config/filebeat.yml /usr/share/filebeat/filebeat.yml

USER root
# Create a directory to map volume with all docker log files
# RUN mkdir /usr/share/filebeat/dockerlogs
RUN chown -R root /usr/share/filebeat/
RUN chmod -R go-w /usr/share/filebeat/

# Set the command to run Filebeat when the container starts
ENTRYPOINT ["/usr/share/filebeat/filebeat", "-e"]