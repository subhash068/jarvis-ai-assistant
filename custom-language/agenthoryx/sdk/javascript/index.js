class AgenthoryxClient {
  constructor(endpoint = 'http://localhost:8080') {
    this.endpoint = endpoint;
  }

  async run(code) {
    const response = await fetch(`${this.endpoint}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    
    if (!response.ok) {
      throw new Error(`Agenthoryx Error: ${await response.text()}`);
    }
    
    const data = await response.json();
    return data.output;
  }
}

class Agent {
  constructor(name, client = new AgenthoryxClient()) {
    this.name = name;
    this.client = client;
  }

  async chat(prompt) {
    const code = `
      let agent = new Agent("${this.name}");
      return agent.chat("${prompt}");
    `;
    return this.client.run(code);
  }
}

module.exports = { AgenthoryxClient, Agent };
