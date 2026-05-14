// socket.js
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from '../models/messages.model.js';
import User from '../models/user.model.js';

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV !== "production" 
        ? "http://localhost:3001"  // Development
        : undefined,               // Production - will use same origin
      credentials: true
    }
  });

  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      console.log('Authenticating socket connection');
      const userId = socket.handshake.auth.userId;
      if (!userId) {
        return next(new Error('Authentication error: No user ID provided'));
      }

      const user = await User.findById(userId).select("-password");
    
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Track online users
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    onlineUsers.set(socket.user._id, socket.id);

    console.log('User connected:', socket.user.firstName, socket.user._id);

    // Emit online status to all connected clients
    io.emit('userOnline', socket.user._id);

    // Handle private messages
    socket.on('privateMessage', async (data) => {
      const { recipientId, content, attachmentId } = data;

      console.log('Private message received:', data);
      
      try {
        // Save message to database using your existing createMessage logic
        const message = new Message({
          sender: socket.user._id,
          recipient: recipientId,
          content,
          attachment: attachmentId || null,
        });
        await message.save();

        // Update conversation
        await Conversation.findOneAndUpdate(
          {
            participants: {
              $all: [socket.user._id, recipientId],
            },
          },
          {
            $addToSet: { participants: [socket.user._id, recipientId] },
            lastMessage: message._id,
          },
          { upsert: true }
        );

        // Send to recipient if online
        const recipientSocketId = onlineUsers.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('newMessage', {
            message,
            sender: socket.user._id,
          });
        }

        // Send confirmation to sender
        socket.emit('messageSent', message);
      } catch (error) {
        socket.emit('messageError', { error: 'Failed to send message' });
      }
    });

    // Handle typing status
    socket.on('typing', (data) => {
      const recipientSocketId = onlineUsers.get(data.recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('userTyping', {
          userId: socket.user._id,
          isTyping: data.isTyping
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      onlineUsers.delete(socket._Id);
      io.emit('userOffline', socket.user._id);
      console.log('User disconnected:', socket.user.firstName);
    });
  });

  return io;
};

export default initializeSocket;

// Socket <ref *1> Socket {
//   _events: [Object: null prototype] { error: [Function: noop] },
//   _eventsCount: 1,
//   _maxListeners: undefined,
//   nsp: <ref *2> Namespace {
//     _events: [Object: null prototype] { connection: [Function (anonymous)] },
//     _eventsCount: 1,
//     _maxListeners: undefined,
//     sockets: Map(7) {
//       'MV7nx8PZha5e9iYJAAAE' => [Socket],
//       'K2cQPbhg-zg-Zkm4AAAH' => [Socket],
//       '-xdlhaz_JlpCiflrAAAG' => [Socket],
//       'jhiJtnQVw9wFu3OlAAAF' => [Socket],
//       'RT4e4Z0XPeT-HixlAAAL' => [Socket],
//       'Nj5Ya4Xt3XqyaQXGAAAM' => [Socket],
//       'p6ofLn1SAX-IIxVHAAAN' => [Circular *1]
//     },
//     _preConnectSockets: Map(0) {},
//     _fns: [ [AsyncFunction (anonymous)] ],
//     _ids: 0,
//     server: Server {
//       _events: [Object: null prototype] {},
//       _eventsCount: 0,
//       _maxListeners: undefined,
//       _nsps: [Map],
//       parentNsps: Map(0) {},
//       parentNamespacesFromRegExp: Map(0) {},
//       _path: '/socket.io',
//       clientPathRegex: /^\/socket\.io\/socket\.io(\.msgpack|\.esm)?(\.min)?\.js(\.map)?(?:\?|$)/,
//       _connectTimeout: 45000,
//       _serveClient: true,
//       _parser: [Object],
//       encoder: [Encoder],
//       opts: [Object],
//       _adapter: [class Adapter extends EventEmitter],
//       sockets: [Circular *2],
//       eio: [Server],
//       httpServer: [Server],
//       engine: [Server],
//       _corsMiddleware: [Function: corsMiddleware],
//       [Symbol(shapeMode)]: false,
//       [Symbol(kCapture)]: false
//     },
//     name: '/',
//     adapter: Adapter {
//       _events: [Object: null prototype] {},
//       _eventsCount: 0,
//       _maxListeners: undefined,
//       nsp: [Circular *2],
//       rooms: [Map],
//       sids: [Map],
//       encoder: [Encoder],
//       [Symbol(shapeMode)]: false,
//       [Symbol(kCapture)]: false
//     },
//     [Symbol(shapeMode)]: false,
//     [Symbol(kCapture)]: false
//   },
//   client: Client {
//     sockets: Map(1) { 'p6ofLn1SAX-IIxVHAAAN' => [Circular *1] },
//     nsps: Map(1) { '/' => [Circular *1] },
//     server: Server {
//       _events: [Object: null prototype] {},
//       _eventsCount: 0,
//       _maxListeners: undefined,
//       _nsps: [Map],
//       parentNsps: Map(0) {},
//       parentNamespacesFromRegExp: Map(0) {},
//       _path: '/socket.io',
//       clientPathRegex: /^\/socket\.io\/socket\.io(\.msgpack|\.esm)?(\.min)?\.js(\.map)?(?:\?|$)/,
//       _connectTimeout: 45000,
//       _serveClient: true,
//       _parser: [Object],
//       encoder: [Encoder],
//       opts: [Object],
//       _adapter: [class Adapter extends EventEmitter],
//       sockets: [Namespace],
//       eio: [Server],
//       httpServer: [Server],
//       engine: [Server],
//       _corsMiddleware: [Function: corsMiddleware],
//       [Symbol(shapeMode)]: false,
//       [Symbol(kCapture)]: false
//     },
//     conn: Socket {
//       _events: [Object: null prototype],
//       _eventsCount: 3,
//       _maxListeners: undefined,
//       _readyState: 'open',
//       upgrading: false,
//       upgraded: true,
//       writeBuffer: [],
//       packetsFn: [],
//       sentCallbackFn: [Array],
//       cleanupFn: [Array],
//       id: 'cUfEVJ_xxlSJ1mijAAAK',
//       server: [Server],
//       request: [IncomingMessage],
//       protocol: 4,
//       remoteAddress: '::1',
//       pingTimeoutTimer: null,
//       pingIntervalTimer: Timeout {
//         _idleTimeout: 25000,
//         _idlePrev: [TimersList],
//         _idleNext: [Timeout],
//         _idleStart: 1816,
//         _onTimeout: [Function (anonymous)],
//         _timerArgs: undefined,
//         _repeat: null,
//         _destroyed: false,
//         [Symbol(refed)]: true,
//         [Symbol(kHasPrimitive)]: false,
//         [Symbol(asyncId)]: 1015,
//         [Symbol(triggerId)]: 0
//       },
//       transport: [WebSocket],
//       [Symbol(shapeMode)]: false,
//       [Symbol(kCapture)]: false
//     },
//     encoder: Encoder { replacer: undefined },
//     decoder: Decoder { reviver: undefined, _callbacks: [Object] },
//     id: 'cUfEVJ_xxlSJ1mijAAAK',
//     onclose: [Function: bound onclose],
//     ondata: [Function: bound ondata],
//     onerror: [Function: bound onerror],
//     ondecoded: [Function: bound ondecoded],
//     connectTimeout: undefined
//   },
//   recovered: false,
//   data: {},
//   connected: true,
//   acks: Map(0) {},
//   fns: [],
//   flags: {},
//   server: <ref *3> Server {
//     _events: [Object: null prototype] {},
//     _eventsCount: 0,
//     _maxListeners: undefined,
//     _nsps: Map(1) { '/' => [Namespace] },
//     parentNsps: Map(0) {},
//     parentNamespacesFromRegExp: Map(0) {},
//     _path: '/socket.io',
//     clientPathRegex: /^\/socket\.io\/socket\.io(\.msgpack|\.esm)?(\.min)?\.js(\.map)?(?:\?|$)/,
//     _connectTimeout: 45000,
//     _serveClient: true,
//     _parser: {
//       protocol: 5,
//       PacketType: [Object],
//       Encoder: [class Encoder],
//       Decoder: [class Decoder extends Emitter]
//     },
//     encoder: Encoder { replacer: undefined },
//     opts: { cors: [Object], cleanupEmptyChildNamespaces: false },
//     _adapter: [class Adapter extends EventEmitter],
//     sockets: <ref *2> Namespace {
//       _events: [Object: null prototype],
//       _eventsCount: 1,
//       _maxListeners: undefined,
//       sockets: [Map],
//       _preConnectSockets: Map(0) {},
//       _fns: [Array],
//       _ids: 0,
//       server: [Circular *3],
//       name: '/',
//       adapter: [Adapter],
//       [Symbol(shapeMode)]: false,
//       [Symbol(kCapture)]: false
//     },
//     eio: Server {
//       _events: [Object: null prototype],
//       _eventsCount: 1,
//       _maxListeners: undefined,
//       middlewares: [Array],
//       clients: [Object],
//       clientsCount: 7,
//       opts: [Object],
//       ws: [WebSocketServer],
//       [Symbol(shapeMode)]: false,
//       [Symbol(kCapture)]: false
//     },
//     httpServer: Server {
//       maxHeaderSize: undefined,
//       insecureHTTPParser: undefined,
//       requestTimeout: 300000,
//       headersTimeout: 60000,
//       keepAliveTimeout: 5000,
//       connectionsCheckingInterval: 30000,
//       requireHostHeader: true,
//       joinDuplicateHeaders: undefined,
//       rejectNonStandardBodyWrites: false,
//       _events: [Object: null prototype],
//       _eventsCount: 5,
//       _maxListeners: undefined,
//       _connections: 13,
//       _handle: [TCP],
//       _usingWorkers: false,
//       _workers: [],
//       _unref: false,
//       _listeningId: 2,
//       allowHalfOpen: true,
//       pauseOnConnect: false,
//       noDelay: true,
//       keepAlive: false,
//       keepAliveInitialDelay: 0,
//       highWaterMark: 65536,
//       httpAllowHalfOpen: false,
//       timeout: 0,
//       maxHeadersCount: null,
//       maxRequestsPerSocket: 0,
//       _connectionKey: '6::::5100',
//       [Symbol(IncomingMessage)]: [Function: IncomingMessage],
//       [Symbol(ServerResponse)]: [Function: ServerResponse],
//       [Symbol(shapeMode)]: false,
//       [Symbol(kCapture)]: false,
//       [Symbol(async_id_symbol)]: 479,
//       [Symbol(kUniqueHeaders)]: null,
//       [Symbol(http.server.connections)]: ConnectionsList {},
//       [Symbol(http.server.connectionsCheckingInterval)]: Timeout {
//         _idleTimeout: 30000,
//         _idlePrev: [TimersList],
//         _idleNext: [TimersList],
//         _idleStart: 469,
//         _onTimeout: [Function: bound checkConnections],
//         _timerArgs: undefined,
//         _repeat: 30000,
//         _destroyed: false,
//         [Symbol(refed)]: false,
//         [Symbol(kHasPrimitive)]: false,
//         [Symbol(asyncId)]: 481,
//         [Symbol(triggerId)]: 480
//       }
//     },
//     engine: Server {
//       _events: [Object: null prototype],
//       _eventsCount: 1,
//       _maxListeners: undefined,
//       middlewares: [Array],
//       clients: [Object],
//       clientsCount: 7,
//       opts: [Object],
//       ws: [WebSocketServer],
//       [Symbol(shapeMode)]: false,
//       [Symbol(kCapture)]: false
//     },
//     _corsMiddleware: [Function: corsMiddleware],
//     [Symbol(shapeMode)]: false,
//     [Symbol(kCapture)]: false
//   },
//   adapter: <ref *4> Adapter {
//     _events: [Object: null prototype] {},
//     _eventsCount: 0,
//     _maxListeners: undefined,
//     nsp: <ref *2> Namespace {
//       _events: [Object: null prototype],
//       _eventsCount: 1,
//       _maxListeners: undefined,
//       sockets: [Map],
//       _preConnectSockets: Map(0) {},
//       _fns: [Array],
//       _ids: 0,
//       server: [Server],
//       name: '/',
//       adapter: [Circular *4],
//       [Symbol(shapeMode)]: false,
//       [Symbol(kCapture)]: false
//     },
//     rooms: Map(7) {
//       'MV7nx8PZha5e9iYJAAAE' => [Set],
//       'K2cQPbhg-zg-Zkm4AAAH' => [Set],
//       '-xdlhaz_JlpCiflrAAAG' => [Set],
//       'jhiJtnQVw9wFu3OlAAAF' => [Set],
//       'RT4e4Z0XPeT-HixlAAAL' => [Set],
//       'Nj5Ya4Xt3XqyaQXGAAAM' => [Set],
//       'p6ofLn1SAX-IIxVHAAAN' => [Set]
//     },
//     sids: Map(7) {
//       'MV7nx8PZha5e9iYJAAAE' => [Set],
//       'K2cQPbhg-zg-Zkm4AAAH' => [Set],
//       '-xdlhaz_JlpCiflrAAAG' => [Set],
//       'jhiJtnQVw9wFu3OlAAAF' => [Set],
//       'RT4e4Z0XPeT-HixlAAAL' => [Set],
//       'Nj5Ya4Xt3XqyaQXGAAAM' => [Set],
//       'p6ofLn1SAX-IIxVHAAAN' => [Set]
//     },
//     encoder: Encoder { replacer: undefined },
//     [Symbol(shapeMode)]: false,
//     [Symbol(kCapture)]: false
//   },
//   id: 'p6ofLn1SAX-IIxVHAAAN',
//   handshake: {
//     headers: {
//       host: 'localhost:5100',
//       connection: 'keep-alive',
//       'sec-ch-ua-platform': '"macOS"',
//       'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
//       accept: '*/*',
//       'sec-ch-ua': '"Chromium";v="130", "Brave";v="130", "Not?A_Brand";v="99"',
//       'sec-ch-ua-mobile': '?0',
//       'sec-gpc': '1',
//       'accept-language': 'en-US,en',
//       origin: 'http://localhost:3001',
//       'sec-fetch-site': 'same-site',
//       'sec-fetch-mode': 'cors',
//       'sec-fetch-dest': 'empty',
//       referer: 'http://localhost:3001/',
//       'accept-encoding': 'gzip, deflate, br, zstd',
//       cookie: 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzU0NDA3ZDg2MDMwYTkyZDI5OWE2YjEiLCJpYXQiOjE3Mzc0ODUwMDAsImV4cCI6MTczNzc0NDIwMH0.XgImNtQYlNHY_IrvfuEAaLqM1TUiCasQA-4QmcrG4pw'
//     },
//     time: 'Tue Jan 21 2025 14:57:07 GMT-0500 (Eastern Standard Time)',
//     address: '::1',
//     xdomain: true,
//     secure: false,
//     issued: 1737489427689,
//     url: '/socket.io/?EIO=4&transport=polling&t=wcel1sov',
//     query: [Object: null prototype] {
//       EIO: '4',
//       transport: 'polling',
//       t: 'wcel1sov'
//     },
//     auth: { userId: '6754407d86030a92d299a6b1' }
//   },
//   user: {
//     location: 'New Jercey',
//     _id: new ObjectId('6754407d86030a92d299a6b1'),
//     firstName: 'Jaydeep',
//     lastName: 'Baravaliya',
//     email: 'jaydeep@gmail.com',
//     username: 'jaydeep123456',
//     role: 'Worker',
//     headline: 'Carpenter',
//     bio: 'I am user of LynkCircles',
//     connections: [
//       new ObjectId('6753aa0532dd5a97a708b9a2'),
//       new ObjectId('675908477ffbbd3e63c23309'),
//       new ObjectId('6759fdeea5500d8a59a88ac4'),
//       new ObjectId('675a01aba5500d8a59a88c14'),
//       new ObjectId('675f37b363354989787a38ca')
//     ],
//     savedWorkers: [],
//     followingClients: [],
//     communityJoined: [],
//     status: 'active',
//     resetPasswordToken: null,
//     resetPasswordTokenExpiration: null,
//     verified: false,
//     createdAt: 2024-12-07T12:33:01.698Z,
//     updatedAt: 2025-01-21T18:44:36.016Z,
//     __v: 4,
//     bannerImage: 'https://res.cloudinary.com/deketts10/image/upload/v1733692912/banner/cn515voenngjksxbsw7b.avif',
//     profilePicture: 'https://res.cloudinary.com/deketts10/image/upload/v1733693061/profile/ls7btbie1zocevuttcpo.jpg',
//     followers: []
//   },
//   [Symbol(shapeMode)]: false,
//   [Symbol(kCapture)]: false
// }