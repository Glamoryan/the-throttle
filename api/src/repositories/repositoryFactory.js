/**
 * Repository Factory Pattern implementation.
 * This factory creates data access objects (repositories) based on the type requested.
 */
class RepositoryFactory {
  constructor() {
    this.repositories = {};
  }

  // Register a repository
  register(name, repository) {
    this.repositories[name] = repository;
  }

  // Get a repository by name
  get(name) {
    const repository = this.repositories[name];
    
    if (!repository) {
      throw new Error(`Repository ${name} not registered`);
    }
    
    return repository;
  }
}

// Create and export a singleton instance
const repositoryFactory = new RepositoryFactory();

module.exports = repositoryFactory; 