CREATE TABLE IF NOT EXISTS factories(
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR (255),
  min INT,
  max INT,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS workers (
  id INT NOT NULL AUTO_INCREMENT,
  value INT,
  factory_id INT,
  PRIMARY KEY (id),
  FOREIGN KEY (factory_id) REFERENCES factories(id)
) ENGINE=InnoDB;
