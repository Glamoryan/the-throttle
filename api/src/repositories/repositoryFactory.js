/**
 * Repository Factory Pattern implementation.
 * This factory creates data access objects (repositories) based on the type requested.
 * 
 * @class RepositoryFactory
 * @description A factory class that manages and provides access to repository instances.
 * Implements the Factory design pattern to centralize repository creation and retrieval.
 */
class RepositoryFactory {
  /**
   * Creates a new RepositoryFactory instance
   * 
   * @constructor
   * @memberof RepositoryFactory
   * @description Initializes the repository registry as an empty object
   */
  constructor() {
    this.repositories = {};
  }

  /**
   * Registers a repository instance with the factory
   * 
   * @method register
   * @memberof RepositoryFactory
   * @param {string} name - The unique name to register the repository under
   * @param {Object} repository - The repository instance to register
   * @returns {void}
   * @description Stores a repository instance in the registry with the specified name
   */
  register(name, repository) {
    this.repositories[name] = repository;
  }

  /**
   * Retrieves a registered repository instance by name
   * 
   * @method get
   * @memberof RepositoryFactory
   * @param {string} name - The name of the repository to retrieve
   * @returns {Object} The requested repository instance
   * @throws {Error} If the requested repository is not registered
   * @description Gets a repository instance from the registry by name.
   * Throws an error if the repository is not found.
   */
  get(name) {
    const repository = this.repositories[name];
    
    if (!repository) {
      throw new Error(`Repository ${name} not registered`);
    }
    
    return repository;
  }
}

// Singleton instance
const repositoryFactory = new RepositoryFactory();

module.exports = repositoryFactory; 