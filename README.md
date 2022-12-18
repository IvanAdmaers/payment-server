# Payment Server

Payment server to simplify creating & handling of orders  

When you create a new order you do not need to think about the logic of a payment system. You only need to think about the logic of this payment server API

***Supported payment systems:***  

* Freekassa (https://freekassa.ru)
* Paypalych (https://paypalych.com)

## Order creation

You need to generate a JWT token which will include all your order data and pass it as a **GET** parameter (/?token=your_token_here) to an API endpoint that you can find below in the [API Endpoints](#api-endpoints) section of a needed payment system.

Code examples:

***TokenService.ts***

```ts
import jwt from 'jsonwebtoken';

const secretKey = process.env.PAYMENT_SERVER_SECURITY_KEY;

export class TokenService {
  public static create(data) {
    const jwtToken = jwt.sign(data, secretKey, { expiresIn: 5 * 60 });

    return jwtToken;
  }

  public static verify(token: string) {
    try {
      const jwtData = jwt.verify(token, secretKey);
  
      return jwtData;
    } catch (error) {
      return null;
    }
  }
}
```

***PaymentService.ts***

```ts
import axios from 'axios';

import { TokenService } from './TokenService';

const paymentServerUrl = process.env.PAYMENT_SERVER_URL;

interface ICreate {
  amount: number;
  orderId: string;
  currency: string;
  email: string;
  paymentMethod: number;
}

interface ICreateReturn {
  error: null | string;
  link?: string;
}

export class PaymentService {
  public static async create(params: ICreate): Promise<ICreateReturn> {
    try {
      const token = TokenService.create({ ...params, orderId: `${params.orderId}` });

      const { data } = await axios.get(
        `${paymentServerUrl}/freekassa?token=${token}`
      );

      return { error: null, link: data.link };
    } catch (error) {
      console.error(error.response.data);
      const errorText =
        error.response.data.error ?? error.response.data.message;

      return { error: errorText };
    }
  }
}
```

***your_controller.ts***

```ts
// ...some code
const { error, link } = await PaymentService.create({
  amount,
  orderId: newOrderId,
  currency,
  email,
  paymentMethod,
});

if (error !== null) {
  // do something to handle the error
  return;
}

return res.status(201).json({ link });
// some code...
```

You will get a response described in the `ICreateReturn` interface. If everything is ok and there are no any errors the `link` parameter is a link that you can pass to your client for paying for his order.

## Order processing

After the payment server gets a notification from a payment system, does checks and whatever, it will send a **POST** request to your URL placed in ***.env*** file (didn't you forget about ***.env.example***, right?) with a JWT token.

***your_controller.ts***
```ts
const { token } = req.body;

if (token === undefined) {
  return res.json({ error: 'token is undefined' });
}

// TokenService code example is above
const tokenData = TokenService.verify(token) as { orderId: string };

if (tokenData === null) {
  return res.json({ error: 'token is invalid' });
}

if (tokenData.orderId === undefined) {
  return res.json({ error: 'token orderId is invalid' });
}

// All good. Handle the order to make your client happy
```

### API Endpoints

*Freekassa*

Create payment - /freekassa/ | **GET**  
Handler - /freekassa/ | **POST**

*Paypalych*

Create payment - /paypalych/create | **POST**  
Handler - /paypalych/handler | **POST**

#### Development

```bash
npm run dev
```

#### Production

```bash
npm run webpack:build

npm run start
```
