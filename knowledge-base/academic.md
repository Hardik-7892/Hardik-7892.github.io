# Academic — Hardik Pandey

Research interests: computer networking and distributed systems, including
protocol measurement, testbed design, and empirical evaluation of network
transport protocols. Open to problems in protocol evaluation, real-world
network conditions, implementation interop, and fair reproducible
benchmarking, and to other topics in computer networking.

## Education

- MSc Computing Science, University of Glasgow, Glasgow, UK (Sept 2025 – Sept 2026),
  awarded with Merit.
  Core: Programming and Systems Development (H); Research and Professional Skills (M);
  Introduction to Data Science and Systems (M); MSc Project for Computing Science (dissertation).
  Elective: Enterprise Cyber Security (M).
  Optional: Human-Centred Security (M); Cyber Security Fundamentals; Cryptography Secure
  Development; Cyber Systems Forensics; Human Computer Interaction Design and Evaluation;
  Secure Systems Programming in Rust.
- B.E. Computer Science & Engineering, Chandigarh University, India (2021 – 2025),
  CGPA 8.14/10. Coursework: Computer Networks; Operating Systems; Cloud Computing
  & Distributed Systems; Data Structures & Algorithms.

## Research experience

MSc Dissertation (2026): "A Reproducible Testbed for Media over QUIC Transport:
Interop, Controlled Impairments and Baselines". Supervisor: Prof. Colin Perkins.
Submitted 10 September 2026, School of Computing Science, University of Glasgow.
Full text: https://hardik-pandey.com/docs/dissertation-hardik-pandey.pdf
Code: https://github.com/Hardik-7892/moqt-testbed

- ContainerNet/Docker testbed evaluating three MOQT implementations (moq-rs,
  imquic, moxygen) across basic, chain and fan-out topologies.
- Wire-level checks: ALPN handshake tiers for draft support, per-subscriber byte
  hash verification for delivery.
- Found a fan-out regression in the pinned moq-rs relay build (every subscriber
  accepted, yet objects flowed to one connection only, at sizes 2 to 8); an
  earlier pin fails differently and H3 serves all; a pin regression, not a
  protocol limit. Not yet filed upstream.
- Impairments via Linux tc (loss, delay, bandwidth, queue); MOQT benchmarked
  against LL-DASH over HTTP/2 and HTTP/3 (~37% H3-over-H2 gain; MOQT ~1.95x H3
  throughput on the same film, each on its own stop clock, byte proof missed on
  most long rows; see dissertation 6.3).
- Reproducibility: every run reproducible from pinned commits, YAML test plans,
  and shaping receipts (logs, qlogs, tc logs); auto pass/partial/fail verdicts.
- Study design: six research questions (draft negotiation, interop tuples, MoQ vs
  LL-DASH delivery, loss/bandwidth limits, fan-out, working-group conformance
  gaps); same 120-second film with 2-second groups across MoQ, H2 and H3.
- Headline results: H3 ~37% above H2 on the same film; MoQ near 2.3 Mbps, ~1.95x
  H3, at near-full cover but failing byte proof on most long rows; moq-rs d18
  fan-out serves exactly one viewer per row (d18 pin regression — d16 shares fate,
  H3 serves all).

## Relevant experience

- Student Intern, Kubernetes & ML Systems, Samsung Electro-Mechanics, Bangalore,
  India (Oct 2024 – Jun 2025). Kubernetes clusters for multi-team distributed ML
  workflows; Grafana/Prometheus monitoring and bottleneck resolution.

## Publications

- Pandey, H. H. et al. "Advance Approaches in AI-Powered Website Development for
  Educational Delivery via Ed-Tech." 2024 International Conference on Trends in
  Quantum Computing and Emerging Business Technologies (TQCEBT), IEEE, 2024.
  DOI: 10.1109/TQCEBT59414.2024.10545211. First author (undergraduate).
  Accepted manuscript hosted at
  https://hardik-pandey.com/docs/ieee-ed-tech-2024-accepted.pdf
  (© 2024 IEEE; version of record via the DOI).

## Technical skills

- Languages: Python, C/C++, Rust, Java
- Systems & Networking: Linux, Docker, Containernet/Mininet, QUIC / HTTP-3,
  TCP/IP, Wireshark, tc, Git
- Infrastructure & Monitoring: Kubernetes, Grafana, Prometheus
- Miscellaneous: LaTeX, Zotero

## PhD direction

Seeking a funded PhD position. Supervision interests: networked systems and
transport protocols, QUIC, Internet measurement, reproducible systems evaluation,
and computer networking broadly. Prefers empirical, measurement-driven
supervision with real artifacts.
Full page: https://hardik-pandey.com/academic.html
