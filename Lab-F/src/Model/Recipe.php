<?php
namespace App\Model;

use App\Service\Config;

class Recipe
{
    private ?int $id = null;
    private ?string $name = null;
    private ?string $instruction = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): Recipe
    {
        $this->id = $id;

        return $this;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): Recipe
    {
        $this->name = $name;

        return $this;
    }

    public function getInstruction(): ?string
    {
        return $this->instruction;
    }

    public function setInstruction(?string $instruction): Recipe
    {
        $this->instruction = $instruction;

        return $this;
    }

    public static function fromArray($array): Recipe
    {
        $post = new self();
        $post->fill($array);

        return $post;
    }

    public function fill($array): Recipe
    {
        if (isset($array['id']) && ! $this->getId()) {
            $this->setId($array['id']);
        }
        if (isset($array['name'])) {
            $this->setName($array['name']);
        }
        if (isset($array['instruction'])) {
            $this->setInstruction($array['instruction']);
        }

        return $this;
    }

    public static function findAll(): array
    {
        $pdo = new \PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        $sql = 'SELECT * FROM recipe';
        $statement = $pdo->prepare($sql);
        $statement->execute();

        $posts = [];
        $postsArray = $statement->fetchAll(\PDO::FETCH_ASSOC);
        foreach ($postsArray as $postArray) {
            $posts[] = self::fromArray($postArray);
        }

        return $posts;
    }

    public static function find($id): ?Recipe
    {
        $pdo = new \PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        $sql = 'SELECT * FROM recipe WHERE id = :id';
        $statement = $pdo->prepare($sql);
        $statement->execute(['id' => $id]);

        $postArray = $statement->fetch(\PDO::FETCH_ASSOC);
        if (! $postArray) {
            return null;
        }
        $post = Recipe::fromArray($postArray);

        return $post;
    }

    public function save(): void
    {
        $pdo = new \PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        if (! $this->getId()) {
            $sql = "INSERT INTO recipe (name,instruction) VALUES (:name, :instruction)";
            $statement = $pdo->prepare($sql);
            $statement->execute([
                'name' => $this->getName(),
                'instruction' => $this->getInstruction(),
            ]);

            $this->setId($pdo->lastInsertId());
        } else {
            $sql = "UPDATE recipe SET name = :name, instruction = :instruction WHERE id = :id";
            $statement = $pdo->prepare($sql);
            $statement->execute([
                ':name' => $this->getName(),
                ':instrucion' => $this->getInstruction(),
                ':id' => $this->getId(),
            ]);
        }
    }

    public function delete(): void
    {
        $pdo = new \PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        $sql = "DELETE FROM recipe WHERE id = :id";
        $statement = $pdo->prepare($sql);
        $statement->execute([
            ':id' => $this->getId(),
        ]);

        $this->setId(null);
        $this->setName(null);
        $this->setInstruction(null);
    }
}
