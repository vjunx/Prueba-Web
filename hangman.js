const dinoWords = [
  { name: "ANKYLOSAURUS", image: "/backgrounds/Ankylosaurus.png" },
  { name: "ALLOSAURUS", image: "/backgrounds/Allosaurus.jpeg" },
  { name: "ANCHIORNIS", image: "/backgrounds/Anchiornis.png" },
  { name: "ARCHAEOPTERYX", image: "/backgrounds/Archaeopteryx.jpeg" },
  { name: "BRACHIOSAURUS", image: "/backgrounds/Brachiosaurus.jpeg" },
  { name: "CARNOTAURUS", image: "/backgrounds/Carnotaurus.png" },
  { name: "CONCAVENATOR", image: "/backgrounds/Concavenator.jpeg" },
  { name: "DEINONYCHUS", image: "/backgrounds/Deinonychus.png" },
  { name: "DILOPHOSAURUS", image: "/backgrounds/Dilophosaurus.jpeg" },
  { name: "DIPLODOCUS", image: "/backgrounds/Diplodocus.jpeg" },
  { name: "GALLIMIMUS", image: "/backgrounds/Gallimimus.jpeg" },
  { name: "IGUANODON", image: "/backgrounds/Iguanodon.jpeg" },
  { name: "GIGANOTOSAURUS", image: "/backgrounds/Giganotosaurus.jpeg" },
  { name: "PACHYCEPHALOSAURUS", image: "/backgrounds/Pachycephalosaurus.jpeg" },
  { name: "PTERANODON", image: "/backgrounds/Pteranodon.jpeg" },
  { name: "STEGOSAURUS", image: "/backgrounds/Stegosaurus.jpeg" },
  { name: "TRICERATOPS", image: "/backgrounds/Triceratops.jpeg" },
  { name: "TYRANNOSAURUS", image: "/backgrounds/Tyrannosaurus.png" },
  { name: "OVIRAPTOR", image: "/backgrounds/Oviraptor.jpeg" },
  { name: "PARASAUROLOPHUS", image: "/backgrounds/Parasaurolophus.jpeg" },
  { name: "PSITTACOSAURUS", image: "/backgrounds/Psittacosaurus.jpg" },
  { name: "QUETZALCOATLUS", image: "/backgrounds/Quetzalcoatlus.jpeg" },
  { name: "SPINOSAURUS", image: "/backgrounds/Spinosaurus.png" },
  { name: "THERIZINOSAURUS", image: "/backgrounds/Therizinosaurus.jpeg" },
  { name: "UTAHRAPTOR", image: "/backgrounds/Utahraptor.png" },
  { name: "VELOCIRAPTOR", image: "/backgrounds/Velociraptor.png" },
  { name: "YUTYRANNUS", image: "/backgrounds/Yutyrannus.png" }
];

const hangmanParts = [
  "1-Base.png", "2-Poste.png", "3-Escuadra.png", "4-Tronco.png", "5-Cuerda.png",
  "6-Patas.png", "7-Ataduras.png", "8-Cuerpo.png", "9-Cabeza.png", "10-Pico.png"
];

let current, word, guessed, fails, usedLetters;

function updateHangmanStack(fails) {
  const container = document.getElementById('hangman-img-stack');
  container.innerHTML = '';
  for (let i = 0; i < fails && i < hangmanParts.length; i++) {
    const img = document.createElement('img');
    img.src = `/hangman/${hangmanParts[i]}`;
    img.style.position = 'absolute';
    img.style.top = 0;
    img.style.left = 0;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.pointerEvents = 'none';
    container.appendChild(img);
  }
}

function showEndImage(type) {
  const overlay = document.getElementById('hangman-result-overlay');
  const img = document.getElementById('hangman-result-img');
  const msg = document.getElementById('hangman-result-message');
  img.src = `/hangman/${type}.jpeg`;
  msg.textContent = (type === 'winner') ? "¡Ganaste!" : `¡Perdiste! Era: ${word}`;
  overlay.style.display = 'flex';
}

function startHangman() {
  current = dinoWords[Math.floor(Math.random() * dinoWords.length)];
  word = current.name;
  guessed = Array(word.length).fill('_');
  fails = 0;
  usedLetters = [];
  updateHangmanStack(fails);
  document.getElementById('hangman-dino-img').src = current.image;
  document.getElementById('hangman-word').textContent = guessed.join(' ');
  document.getElementById('hangman-letters').textContent = '';
  document.getElementById('hangman-message').textContent = '';
  document.getElementById('hangman-input').value = '';
  document.getElementById('hangman-input').disabled = false;
  document.getElementById('hangman-try').disabled = false;
  document.getElementById('hangman-restart').style.display = 'none';
}

document.getElementById('hangman-try').onclick = function() {
  const input = document.getElementById('hangman-input');
  const letter = input.value.toUpperCase();
  input.value = '';
  if (!letter.match(/[A-ZÑ]/)) return;

  let found = false;
  for (let i = 0; i < word.length; i++) {
    if (word[i] === letter) {
      guessed[i] = letter;
      found = true;
    }
  }

  if (!usedLetters.includes(letter)) {
    usedLetters.push(letter);
    document.getElementById('hangman-letters').textContent = usedLetters.join(', ');
    if (!found) {
      fails++;
      updateHangmanStack(fails);
    }
  } else if (!found) {
    fails++;
    updateHangmanStack(fails);
  }

  document.getElementById('hangman-word').textContent = guessed.join(' ');

  if (guessed.join('') === word) {
    updateHangmanStack(hangmanParts.length);
    showEndImage('winner');
    input.disabled = true;
    document.getElementById('hangman-try').disabled = true;
  } else if (fails >= hangmanParts.length) {
    updateHangmanStack(hangmanParts.length);
    showEndImage('loser');
    input.disabled = true;
    document.getElementById('hangman-try').disabled = true;
  }
};

document.getElementById('hangman-restart').onclick = function() {
  document.getElementById('hangman-result-overlay').style.display = 'none';
  startHangman();
};

document.getElementById('show-hangman').onclick = function() {
  document.getElementById('hangman-game').style.display = '';
  window.scrollTo({ top: document.getElementById('hangman-game').offsetTop, behavior: 'smooth' });
  startHangman();
};

document.getElementById('hangman-input').addEventListener('keyup', function(e) {
  if (e.key === 'Enter') {
    document.getElementById('hangman-try').click();
  }
});

document.getElementById('hangman-restart-overlay').onclick = function() {
  document.getElementById('hangman-result-overlay').style.display = 'none';
  startHangman();
};

document.getElementById('hangman-close').onclick = function() {
  document.getElementById('hangman-game').style.display = 'none';
  document.getElementById('hangman-result-overlay').style.display = 'none'; // Oculta el overlay si está abierto
};