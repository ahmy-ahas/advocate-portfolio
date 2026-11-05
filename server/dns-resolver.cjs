// Node is pointed at a local DNS stub that refuses Atlas SRV queries on this machine.
require('node:dns').setServers(['192.168.1.1']);
