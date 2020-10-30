class Network {
  constructor({ host }) {
    this.host = host
  }
    
  parseManifestURL({ url, fileResolution, fileResolutionTag, hostTag }) {
    return url
      .replace(fileResolutionTag, fileResolution)
      .replace(hostTag, this.host);

  }

  async fetchFile(url) {
    const reponse = await fetch(url);
    // importante retornar como buffer pq o video séra carragado sob demanda pelo HTML
    return reponse.arrayBuffer();
  }
}