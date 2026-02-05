const PhysicsEngine = {
    scene: null, camera: null, renderer: null,
    puck: null, mallet: null,
    labId: null,

    init(labId) {
        this.labId = labId;
        const container = document.getElementById('simulation-canvas');
        container.classList.remove('hidden');

        this.scene = new THREE.Scene();
        // 注文：真上から見るが奥行きがある（PerspectiveCamera）
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 40, 15);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(this.renderer.domElement);

        // フィールド・ライト生成（省略：前のコードと同様）
        this.createObjects();
        this.animate();

        // 注文：マウス移動でマレット操作
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    },

    handleMouseMove(e) {
        // マウス座標を3D空間のZ/X軸に変換
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const z = (e.clientY / window.innerHeight) * 2 - 1;
        
        const vector = { x: x * 10, z: z * 15 };
        this.mallet.position.x = vector.x;
        this.mallet.position.z = vector.z;

        // 注文：精密なリアルタイム同期
        socket.emit('sim:vector', { labId: this.labId, uid: UIManager.user.uid, pos: vector });
    },

    animate() {
        requestAnimationFrame(() => this.animate());
        // ここで衝突判定(前述のPhysicsLogic)を実行
        this.renderer.render(this.scene, this.camera);
    }
};
