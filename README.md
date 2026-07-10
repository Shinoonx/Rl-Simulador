# RL Guard: Nodo de Defensa

Web interactiva desarrollada para demostrar cómo el Aprendizaje por Refuerzo (Reinforcement Learning - RL) puede ser aplicado a la detección de anomalías e intrusiones en redes computacionales (IDS).

## Descripción del Proyecto
Este simulador permite visualizar en tiempo real cómo un agente basado en el algoritmo **Q-Learning** aprende a diferenciar entre tráfico de red legítimo y amenazas (anomalías). El agente no tiene reglas preprogramadas; en su lugar, optimiza su política de decisiones interactuando con el entorno (flujo de datos) y recibiendo recompensas o penalizaciones según su desempeño.

## Tecnologías Utilizadas
El proyecto fue construido utilizando tecnologías web nativas, sin dependencias externas para garantizar su ligereza y ejecución directa en el navegador:
*   **HTML5 & CSS3:** Estructura y diseño de interfaz (UI) moderna y responsive.
*   **JavaScript Vanilla:** Lógica del algoritmo Q-Learning y Ecuación de Bellman.
*   **HTML5 Canvas API:** Renderizado del simulador visual y animaciones a 60 FPS.

## Instalación y Ejecución
1. Clonar este repositorio localmente:
   ```bash
   git clone [https://github.com/Shinoonx/Rl-Simulador.git]