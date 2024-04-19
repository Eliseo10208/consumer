import { connect, Channel, ConsumeMessage } from "amqplib";
import axios from 'axios';

// Definir la clase Pago
class Pago {
    idPago: string;
    cantidad: number;
    concepto: string;

    constructor(idPago: string, cantidad: number, concepto: string) {
        this.idPago = idPago;
        this.cantidad = cantidad;
        this.concepto = concepto;
    }
}

async function main() {
    const connection = await connect('amqp://admin:zoe10208@34.198.106.93');
    const channel: Channel = await connection.createChannel();
    const queue: string = 'up.practica';
    await channel.assertQueue(queue, { durable: true });

    // Este bucle while hará que el script se mantenga escuchando continuamente
    while (true) {
        await new Promise<void>((resolve) => {
            channel.consume(queue, async (message: ConsumeMessage | null) => {
                if (message !== null) {
                    try {
                        const payload = message.content.toString();
                        console.log('Message received:', payload);

                        const pago: Pago = JSON.parse(payload);
                        console.log('Pago object:', pago);

                        const dataToSend = {
                            idFactura: pago.idPago,
                            pagoid: pago.cantidad
                        };
                        console.log("datos a mandar")
                        console.log(dataToSend)

                        await axios.post('https://service-payment-8hs5.onrender.com/facturas', dataToSend);
                        console.log('Payment processed');
                    } catch (error) {
                        console.error('Error processing message:', error);
                    } finally {
                        channel.ack(message);
                    }
                }
                resolve(); // Resuelve la promesa para permitir que el bucle continúe después de procesar un mensaje
            });
        });
    }
}

main().catch(console.error);
