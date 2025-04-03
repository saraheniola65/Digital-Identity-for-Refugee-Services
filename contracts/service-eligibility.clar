;; Service Eligibility Contract
;; Determines appropriate aid and support

(define-map service-types
  { service-id: uint }
  {
    name: (string-utf8 100),
    description: (string-utf8 500),
    requirements: (list 10 (string-utf8 100))
  }
)

(define-map eligibility
  { identity-id: uint, service-id: uint }
  {
    is-eligible: bool,
    eligibility-reason: (string-utf8 200),
    verified-by: principal,
    verification-time: uint
  }
)

(define-data-var next-service-id uint u0)

(define-constant contract-owner tx-sender)

(define-public (register-service
  (name (string-utf8 100))
  (description (string-utf8 500))
  (requirements (list 10 (string-utf8 100))))
  (begin
    (asserts! (is-eq tx-sender contract-owner) (err u401))
    (let ((service-id (var-get next-service-id)))
      (map-set service-types
        {service-id: service-id}
        {
          name: name,
          description: description,
          requirements: requirements
        })
      (var-set next-service-id (+ service-id u1))
      (ok service-id))))

(define-public (verify-eligibility
  (identity-id uint)
  (service-id uint)
  (is-eligible bool)
  (eligibility-reason (string-utf8 200)))
  (let ((verification-time (get-block-info? time (- block-height u1))))
    ;; Check if service exists
    (asserts! (is-some (map-get? service-types {service-id: service-id})) (err u404))

    ;; Set eligibility
    (map-set eligibility
      {identity-id: identity-id, service-id: service-id}
      {
        is-eligible: is-eligible,
        eligibility-reason: eligibility-reason,
        verified-by: tx-sender,
        verification-time: (default-to u0 verification-time)
      })
    (ok true)))

(define-read-only (check-eligibility (identity-id uint) (service-id uint))
  (map-get? eligibility {identity-id: identity-id, service-id: service-id}))

(define-read-only (get-service (service-id uint))
  (map-get? service-types {service-id: service-id}))
