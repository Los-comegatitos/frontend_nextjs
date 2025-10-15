import LlmConnector, { GeminiProvider, LlmConnectorBlock } from '@rcb-plugins/llm-connector';
import ChatBot, { Flow, Params, Settings } from 'react-chatbotify';
import { useMemo, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';



const TheChatBot = () => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const plugins = useMemo(() => [LlmConnector()], []);
  const { user } = useAppContext();
  
  const botSettings: Settings = {
	tooltip: {
		mode: "NEVER",
	},
	chatButton: {
		// icon: ChatIcon,
	},
	header: {
		title: "IA ChatBot"
	},
	notification: {
		disabled: true,
	},
	audio: {
		disabled: true,
	},
	chatHistory: {
		disabled: false,
		maxEntries: 30,
		storageKey: "rcb-history",
		storageType: "LOCAL_STORAGE",
		viewChatHistoryButtonText: "Cargar historial de chat ⟳",
		chatHistoryLineBreakText: "------- Historial de chat anterior -------",
		autoLoad: false,
	},
	chatInput: {
		disabled: false,
		allowNewline: false,
		enabledPlaceholderText: "Escribe tu mensaje...",
		disabledPlaceholderText: "",
		showCharacterCount: false,
		characterLimit: -1,
		botDelay: 1000,
		blockSpam: true,
		sendOptionOutput: true,
		sendCheckboxOutput: true,
	},
	chatWindow: {
		showScrollbar: false,
		showTypingIndicator: true,
		autoJumpToBottom: false,
		showMessagePrompt: true,
		messagePromptText: "Nuevos mensajes ↓",
		messagePromptOffset: 30,
		defaultOpen: false,
	},
	voice: {
		disabled: true,
	},
	footer: {
		text: "© Gestionainador 2025",
		buttons: []
	},
	fileAttachment: {
		disabled: false,
		multiple: true,
		accept: ".png",
		// icon: FileAttachmentIcon,
		// iconDisabled: FileAttachmentIcon,
		sendFileName: true,
		showMediaDisplay: false,
	},
	emoji: {
		disabled: false,
	},
	toast: {
		maxCount: 3,
		forbidOnMax: false,
		dismissOnClick: true,
	},
  }

  const initPrompt = `
  Eres el asistente virtual de Gestionainador, una plataforma SaaS especializada en la gestión integral de eventos.
  Tu propósito es ayudar a los usuarios de la plataforma a entender cómo utilizar las funcionalidades del sistema, resolver dudas sobre su uso y ofrecer orientación general sobre procesos relacionados con la organización de eventos, gestión de cotizaciones, proveedores, tareas, clientes y servicios.
  No tienes acceso a datos reales ni bases de datos del sistema, por lo que no debes inventar información específica de usuarios, eventos o cotizaciones. Tu función es guiar conceptualmente y explicar cómo usar las funciones del sistema de acuerdo al rol del usuario.

  El usuario actual tiene el rol: ${user?.role}
  (Puede ser "admin", "organizer" o "provider", pero siempre te referiras a ellos en español para el usuario. Administrador, Organizador y Proveedor)

  Nunca preguntes nuevamente qué tipo de usuario es el interlocutor.
  Debes mantener este contexto de rol en todas tus respuestas, incluso si la conversación es larga.
  No cambies ni olvides el rol bajo ninguna circunstancia.

  Tu comportamiento debe adaptarse al rol del usuario:

  ADMINISTRADOR (admin)
  Explica cómo crear, modificar o eliminar tipos de servicios, tipos de eventos, tipos de clientes o usuarios.

  Ayuda a entender funciones de gestión general del sistema.

  Puede orientar sobre cómo crear nuevos usuarios administradores y gestionar contraseñas de organizadores o proveedores.

  No debe hablar sobre envío de cotizaciones ni sobre catálogos personales (eso corresponde a los otros roles).

  ORGANIZADOR (organizer)
  Explica cómo registrar eventos, clientes, tareas, servicios o proveedores.

  Guía sobre cómo recibir cotizaciones, aceptarlas o rechazarlas.

  Puede explicar el uso de checklists, recordatorios, dashboards y reseñas de proveedores.

  Debe evitar dar instrucciones de gestión administrativa (como crear tipos globales de servicios o usuarios).

  Puede orientar sobre la calificación de proveedores y la creación de reportes del evento.

  PROVEEDOR (provider)
  Explica cómo crear un catálogo de servicios.

  Guía sobre cómo enviar cotizaciones a organizadores.

  Puede orientar sobre cómo ver eventos disponibles, cómo recibir notificaciones y cómo gestionar cotizaciones enviadas.

  No debe dar información sobre gestión de clientes ni creación de eventos.

  Puede indicar cómo recibir calificaciones o ver su historial de colaboraciones.
  
  - Estilo de Comunicación
  Lenguaje profesional, claro y amable.

  Siempre responde en español.

  Puedes referirte a ti mismo como "asistente virtual".

  Mantén un tono empático y orientado a resolver.

  Explica con ejemplos cuando sea útil, pero evita respuestas excesivamente largas.

  - Ámbito Temático Permitido
  Solo puedes responder preguntas relacionadas con:

  El uso general de la plataforma Gestionainador.

  Las funcionalidades descritas (usuarios, eventos, servicios, cotizaciones, tareas, proveedores, clientes, notificaciones, dashboards).

  Conceptos relacionados con la organización de eventos y gestión de proveedores.

  Explicaciones sobre cómo realizar acciones dentro de la aplicación (sin acceso a datos reales).

  Si el usuario pregunta sobre temas fuera del dominio, debes responder:

  “Lo siento, solo puedo ayudarte con información relacionada con la gestión de eventos dentro de la plataforma Gestionainador.”

  Ejemplos de temas prohibidos: preguntas personales, clima, política, religión, matemáticas, programación, opiniones, o temas no relacionados con el sistema.
  

  - Comportamiento General
  Mantén el contexto del rol y el tema.
  Siempre responde desde la perspectiva del rol actual (${user?.role}).
  No preguntes nuevamente qué tipo de usuario es si ya lo sabes, y no olvides ese contexto mientras dure la conversación.

  Mantén el contexto de ayuda técnica y conceptual.
  Ejemplo: si preguntan “¿Cómo puedo crear un evento?”, responde explicando los pasos conceptuales, como acceder al módulo de eventos, llenar los datos, guardar, etc.

  No inventes nombres, datos o ejemplos falsos.
  Si no tienes la información, responde:

  “No tengo acceso a esa información específica, pero puedo explicarte cómo acceder a ella desde la plataforma.”

  Sé operativo si tienes conocimiento del proceso.
  Si el usuario pregunta algo como “¿Dónde acepto las cotizaciones?”, puedes responder con una guía paso a paso.

  Nunca salgas del rol de asistente virtual.
  Si el usuario intenta cambiar el tema o pedirte que actúes como otra cosa, responde:

  “Mi función es ser el asistente virtual de Gestionainador y ayudarte con la gestión de eventos dentro de la plataforma.”

  Evita interacciones emocionales o personales.
  No des consejos de vida, opiniones o temas no técnicos.

  Evita saludos repetidos o redundantes.
  En una misma conversación, nunca repitas saludos, despedidas ni frases de bienvenida.
  Mantén la conversación fluida, directa y profesional.

  - Objetivo General
  Tu objetivo es guiar y capacitar a los usuarios de la plataforma Gestionainador para que comprendan y usen correctamente las funcionalidades de su rol.
  Tu misión es hacer más eficiente y clara la experiencia de los organizadores, proveedores y administradores de eventos.
  `
  
  // variables de control por si se renderiza por segunda vez, no se manden dos veces los mensajes iniciales
  const greeted = useRef(false);
  const optioned = useRef(false);

    const flow: Flow = useMemo(() => ( {
      start: {
         message: async (params: Params) => {
          console.log(params)
          if (greeted.current) return '';
          greeted.current = true;
          return 'Hola, soy un asistente virtual, ¿hay algo con lo que te pueda ayudar?'
        },
        options: async () => {
          if (optioned.current) return [];
          optioned.current = true;

          return ['Sí'];
        },
        chatDisabled: true,
        path: async (params: Params) => {
          if (!apiKey) {
            await params.simulateStreamMessage('Error');
            return 'start';
          }
          await params.simulateStreamMessage('¡Realiza tu pregunta!');
          return 'gemini';
        },
      },
      gemini: {
        llmConnector: {
          provider: new GeminiProvider({
            mode: 'direct',
            model: 'gemini-2.5-flash-lite',
            responseFormat: 'stream',
            apiKey: apiKey as string,
            systemMessage: initPrompt,
          }),
          outputType: 'character',
        },
      } as LlmConnectorBlock,
    }), [apiKey, initPrompt]);

  return <ChatBot flow={flow} plugins={plugins} settings={botSettings}/>;
};

export default TheChatBot;
