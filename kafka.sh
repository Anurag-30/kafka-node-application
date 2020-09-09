#! /bin/bash

if [ $1 == "start" ]
then 

kubectl apply -f 00-namespace/
kubectl apply -f 01-zookeeper/
kubectl apply -f 02-kafka/
kubectl apply -f 03-yahoo-kafka-manager/
kubectl apply -f 04-kafka-monitor/
kubectl apply -f 05-mirrormaker/
kubectl apply  -f 06-services/event-bus-publisher/EventBusPublisherDeployment.yaml -f 06-services/event-bus-publisher/EventBusPublisherService.yaml
echo sleeping for 15 seconds before creating listener
sleep 15
kubectl apply -f 06-services/event-bus-listener/EventBusListenerDeployment.yaml -f 06-services/event-bus-listener/EventBusListenerService.yaml 


elif [ $1 == "stop" ]
then
echo "Deleting the Kafka Cluster Namespace"
kubectl delete ns kafka-ca1
kubectl delete  -f 06-services/event-bus-publisher/EventBusPublisherDeployment.yaml -f 06-services/event-bus-publisher/EventBusPublisherService.yaml
kubectl delete -f 06-services/event-bus-listener/EventBusListenerDeployment.yaml -f 06-services/event-bus-listener/EventBusListenerService.yaml 
echo "deleted the listener and publisher"

else 
echo  "wrong input use start or stop"

fi



