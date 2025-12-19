<?php
    /** @var $recipe ?\App\Model\Recipe */
?>

<div class="form-group">
    <label for="name">Name</label>
    <input type="text" id="name" name="post[name]" value="<?= $recipe ? $recipe->getName() : '' ?>">
</div>

<div class="form-group">
    <label for="instruction">Instruction</label>
    <textarea id="instruction" name="post[instruction]"><?= $recipe ? $recipe->getInstruction() : '' ?></textarea>
</div>

<div class="form-group">
    <label></label>
    <input type="submit" value="Submit">
</div>
